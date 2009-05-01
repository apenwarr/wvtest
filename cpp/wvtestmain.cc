#include "wvtest.h"
#include "wvcrash.h"
#include "wvstring.h"
#include <stdlib.h>
#include <stdio.h>
#ifdef _WIN32
#include <io.h>
#include <windows.h>
#else
#include <unistd.h>
#include <fcntl.h>
#endif

static bool fd_is_valid(int fd)
{
#ifdef _WIN32
    if ((HANDLE)_get_osfhandle(fd) != INVALID_HANDLE_VALUE) return true;
#endif    
    int nfd = dup(fd);
    if (nfd >= 0)
    {
	close(nfd);
	return true;
    }
    return false;

}


static int fd_count(const char *when)
{
    int count = 0;
    
    printf("fds open at %s:", when);
    
    for (int fd = 0; fd < 1024; fd++)
    {
	if (fd_is_valid(fd))
	{
	    count++;
	    printf(" %d", fd);
	    fflush(stdout);
	}
    }
    printf("\n");
    
    return count;
}


int main(int argc, char **argv)
{
#ifdef _WIN32
    setup_console_crash();
#endif

    // test wvtest itself.  Not very thorough, but you have to draw the
    // line somewhere :)
    WVPASS(true);
    WVPASS(1);
    WVFAIL(false);
    WVFAIL(0);
    int startfd, endfd;
    char * const *prefixes = NULL;
    
    if (argc > 1)
	prefixes = argv + 1;
    
    startfd = fd_count("start");
    int ret = WvTest::run_all(prefixes);
    
    if (ret == 0) // don't pollute the strace output if we failed anyway
    {
	endfd = fd_count("end");
    
	WVPASS(startfd == endfd);
#ifndef _WIN32
	if (startfd != endfd)
	    system(WvString("ls -l /proc/%s/fd", getpid()));
#endif    
    }
    
    // keep 'make' from aborting if this environment variable is set
    if (getenv("WVTEST_NO_FAIL"))
	return 0;
    else
	return ret;
}
