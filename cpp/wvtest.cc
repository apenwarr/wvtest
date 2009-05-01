/*
 * Worldvisions Weaver Software:
 *   Copyright (C) 1997-2003 Net Integration Technologies, Inc.
 *
 * Part of an automated testing framework.  See wvtest.h.
 */
#include "wvtest.h"
#include "wvautoconf.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#ifdef _WIN32
#include <direct.h>
#else
#include <unistd.h>
#include <sys/wait.h>
#endif
#include <errno.h>
#include <signal.h>

#include <cstdlib>

#ifdef HAVE_VALGRIND_MEMCHECK_H
# include <valgrind/memcheck.h>
# include <valgrind/valgrind.h>
#else
# define VALGRIND_COUNT_ERRORS 0
# define VALGRIND_DO_LEAK_CHECK
# define VALGRIND_COUNT_LEAKS(a,b,c,d) (a=b=c=d=0)
#endif

#define MAX_TEST_TIME 40     // max seconds for a single test to run
#define MAX_TOTAL_TIME 120*60 // max seconds for the entire suite to run

#define TEST_START_FORMAT "! %s:%-5d %-40s "

static int memerrs()
{
    return (int)VALGRIND_COUNT_ERRORS;
}

static int memleaks()
{
    int leaked = 0, dubious = 0, reachable = 0, suppressed = 0;
    VALGRIND_DO_LEAK_CHECK;
    VALGRIND_COUNT_LEAKS(leaked, dubious, reachable, suppressed);
    printf("memleaks: sure:%d dubious:%d reachable:%d suppress:%d\n",
	   leaked, dubious, reachable, suppressed);
    fflush(stdout);
    
    // dubious+reachable are normally non-zero because of globals...
    // return leaked+dubious+reachable;
    return leaked;
}

// Return 1 if no children are running or zombies, 0 if there are any running
// or zombie children.
// Will wait for any already-terminated children first.
// Passes if no rogue children were running, fails otherwise.
// If your test gets a failure in here, either you're not killing all your
// children, or you're not calling waitpid(2) on all of them.
static bool no_running_children()
{
#ifndef _WIN32
    pid_t wait_result;

    // Acknowledge and complain about any zombie children
    do 
    {
	int status = 0;
        wait_result = waitpid(-1, &status, WNOHANG);

        if (wait_result > 0)
        {
            char buf[256];
            snprintf(buf, sizeof(buf) - 1, "%d", wait_result);
            buf[sizeof(buf)-1] = '\0';
            WVFAILEQ("Unclaimed dead child process", buf);
        }
    } while (wait_result > 0);
        
    // There should not be any running children, so waitpid should return -1
    WVPASSEQ(errno, ECHILD);
    WVPASSEQ(wait_result, -1);
    return (wait_result == -1 && errno == ECHILD);
#endif
    return true;
}


WvTest *WvTest::first, *WvTest::last;
int WvTest::fails, WvTest::runs;
time_t WvTest::start_time;
bool WvTest::run_twice = false;

void WvTest::alarm_handler(int)
{
    printf("\n! WvTest  Current test took longer than %d seconds!  FAILED\n",
	   MAX_TEST_TIME);
    fflush(stdout);
    abort();
}


static const char *pathstrip(const char *filename)
{
    const char *cptr;
    cptr = strrchr(filename, '/');
    if (cptr) filename = cptr + 1;
    cptr = strrchr(filename, '\\');
    if (cptr) filename = cptr + 1;
    return filename;
}


WvTest::WvTest(const char *_descr, const char *_idstr, MainFunc *_main,
	       int _slowness) :
    descr(_descr), 
    idstr(pathstrip(_idstr)), 
    main(_main), 
    slowness(_slowness),
    next(NULL)
{
    if (first)
	last->next = this;
    else
	first = this;
    last = this;
}


static bool prefix_match(const char *s, const char * const *prefixes)
{
    for (const char * const *prefix = prefixes; prefix && *prefix; prefix++)
    {
	if (!strncasecmp(s, *prefix, strlen(*prefix)))
	    return true;
    }
    return false;
}


int WvTest::run_all(const char * const *prefixes)
{
    int old_valgrind_errs = 0, new_valgrind_errs;
    int old_valgrind_leaks = 0, new_valgrind_leaks;
    
#ifdef _WIN32
    /* I should be doing something to do with SetTimer here, 
     * not sure exactly what just yet */
#else
    char *disable(getenv("WVTEST_DISABLE_TIMEOUT"));
    if (disable != NULL && disable[0] != '\0' && disable[0] != '0')
        signal(SIGALRM, SIG_IGN);
    else
        signal(SIGALRM, alarm_handler);
    alarm(MAX_TEST_TIME);
#endif
    start_time = time(NULL);
    
    // make sure we can always start out in the same directory, so tests have
    // access to their files.  If a test uses chdir(), we want to be able to
    // reverse it.
    char wd[1024];
    if (!getcwd(wd, sizeof(wd)))
	strcpy(wd, ".");
    
    const char *slowstr1 = getenv("WVTEST_MIN_SLOWNESS");
    const char *slowstr2 = getenv("WVTEST_MAX_SLOWNESS");
    int min_slowness = 0, max_slowness = 65535;
    if (slowstr1) min_slowness = atoi(slowstr1);
    if (slowstr2) max_slowness = atoi(slowstr2);

#ifdef _WIN32
    run_twice = false;
#else
    char *parallel_str = getenv("WVTEST_PARALLEL");
    if (parallel_str) 
        run_twice = atoi(parallel_str) > 0;
#endif

    // there are lots of fflush() calls in here because stupid win32 doesn't
    // flush very often by itself.
    fails = runs = 0;
    for (WvTest *cur = first; cur; cur = cur->next)
    {
	if (cur->slowness <= max_slowness
	    && cur->slowness >= min_slowness
	    && (!prefixes
		|| prefix_match(cur->idstr, prefixes)
		|| prefix_match(cur->descr, prefixes)))
	{
#ifndef _WIN32
            // set SIGPIPE back to default, helps catch tests which don't set
            // this signal to SIG_IGN (which is almost always what you want)
            // on startup
            signal(SIGPIPE, SIG_DFL);

            pid_t child = 0;
            if (run_twice)
            {
                // I see everything twice!
                printf("Running test in parallel.\n");
                child = fork();
            }
#endif

	    printf("\nTesting \"%s\" in %s:\n", cur->descr, cur->idstr);
	    fflush(stdout);
	    
	    cur->main();
	    chdir(wd);
	    
	    new_valgrind_errs = memerrs();
	    WVPASS(new_valgrind_errs == old_valgrind_errs);
	    old_valgrind_errs = new_valgrind_errs;
	    
	    new_valgrind_leaks = memleaks();
	    WVPASS(new_valgrind_leaks == old_valgrind_leaks);
	    old_valgrind_leaks = new_valgrind_leaks;
	    
	    fflush(stderr);
	    printf("\n");
	    fflush(stdout);

#ifndef _WIN32
            if (run_twice)
            {
                if (!child)
                {
                    // I see everything once!
                    printf("Child exiting.\n");
                    _exit(0);
                }
                else
                {
                    printf("Waiting for child to exit.\n");
                    int result;
                    while ((result = waitpid(child, NULL, 0)) == -1 && 
                            errno == EINTR)
                        printf("Waitpid interrupted, retrying.\n");
                }
            }
#endif

            WVPASS(no_running_children());
	}
    }
    
    WVPASS(runs > 0);
    
    if (prefixes && *prefixes && **prefixes)
	printf("WvTest: WARNING: only ran tests starting with "
	       "specifed prefix(es).\n");
    else
	printf("WvTest: ran all tests.\n");
    printf("WvTest: %d test%s, %d failure%s.\n",
	   runs, runs==1 ? "" : "s",
	   fails, fails==1 ? "": "s");
    fflush(stdout);
    
    return fails != 0;
}


// If we aren't running in parallel, we want to output the name of the test
// before we run it, so we know what happened if it crashes.  If we are
// running in parallel, outputting this information in multiple printf()s
// can confuse parsers, so we want to output everything in one printf().
//
// This function gets called by both start() and check().  If we're not
// running in parallel, just print the data.  If we're running in parallel,
// and we're starting a test, save a copy of the file/line/description until
// the test is done and we can output it all at once.
//
// Yes, this is probably the worst API of all time.
void WvTest::print_result(bool start, const char *_file, int _line, 
        const char *_condstr, bool result)
{
    static char *file;
    static char *condstr;
    static int line;
    
    if (start)
    {
        if (file) 
            free(file);
        if (condstr) 
            free(condstr);
        file = strdup(pathstrip(_file));
        condstr = strdup(_condstr);
        line = _line;

        for (char *cptr = condstr; *cptr; cptr++)
        {
            if (!isprint((unsigned char)*cptr))
                *cptr = '!';
        }
    }
            
    const char *result_str = result ? "ok\n" : "FAILED\n";
    if (run_twice)
    {
        if (!start)
            printf(TEST_START_FORMAT "%s", file, line, condstr, result_str);
    }
    else
    {
        if (start)
            printf(TEST_START_FORMAT, file, line, condstr);
        else
            printf("%s", result_str);
    }
    fflush(stdout);

    if (!start)
    {
        if (file)
            free(file);
        if (condstr)
            free(condstr);
        file = condstr = NULL;
    }
}


void WvTest::start(const char *file, int line, const char *condstr)
{
    // Either print the file, line, and condstr, or save them for later.
    print_result(true, file, line, condstr, 0);
}


void WvTest::check(bool cond)
{
#ifndef _WIN32
    alarm(MAX_TEST_TIME); // restart per-test timeout
#endif
    if (!start_time) start_time = time(NULL);
    
    if (time(NULL) - start_time > MAX_TOTAL_TIME)
    {
	printf("\n! WvTest   Total run time exceeded %d seconds!  FAILED\n",
	       MAX_TOTAL_TIME);
	fflush(stdout);
	abort();
    }
    
    runs++;

    print_result(false, NULL, 0, NULL, cond);

    if (!cond)
    {
	fails++;
	
	if (getenv("WVTEST_DIE_FAST"))
	    abort();
    }
}


bool WvTest::start_check_eq(const char *file, int line,
			    const char *a, const char *b, bool expect_pass)
{
    if (!a) a = "";
    if (!b) b = "";
    
    size_t len = strlen(a) + strlen(b) + 8 + 1;
    char *str = new char[len];
    sprintf(str, "[%s] %s [%s]", a, expect_pass ? "==" : "!=", b);
    
    start(file, line, str);
    delete[] str;
    
    bool cond = !strcmp(a, b);
    if (!expect_pass)
        cond = !cond;

    check(cond);
    return cond;
}


bool WvTest::start_check_eq(const char *file, int line, 
                            int a, int b, bool expect_pass)
{
    size_t len = 128 + 128 + 8 + 1;
    char *str = new char[len];
    sprintf(str, "%d %s %d", a, expect_pass ? "==" : "!=", b);
    
    start(file, line, str);
    delete[] str;
    
    bool cond = (a == b);
    if (!expect_pass)
        cond = !cond;

    check(cond);
    return cond;
}


bool WvTest::start_check_lt(const char *file, int line,
			    const char *a, const char *b)
{
    if (!a) a = "";
    if (!b) b = "";
    
    size_t len = strlen(a) + strlen(b) + 8 + 1;
    char *str = new char[len];
    sprintf(str, "[%s] < [%s]", a, b);
    
    start(file, line, str);
    delete[] str;

    bool cond = strcmp(a, b) < 0;
    check(cond);
    return cond;
}


bool WvTest::start_check_lt(const char *file, int line, int a, int b)
{
    size_t len = 128 + 128 + 8 + 1;
    char *str = new char[len];
    sprintf(str, "%d < %d", a, b);
    
    start(file, line, str);
    delete[] str;
    
    bool cond = a < b;
    check(cond);
    return cond;
}
