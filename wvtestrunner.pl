#!/usr/bin/perl -w
use strict;

# always flush
$| = 1;

if (@ARGV < 1) {
    print STDERR "Usage: $0 <command line...>\n";
    exit 127;
}

print STDERR "Testing \"all\" in @ARGV:\n";

my $pid = open(my $fh, "-|");
if (!$pid) {
    # child
    setpgrp();
    open STDERR, '>&STDOUT' or die("Can't dup stdout: $!\n");
    exec(@ARGV);
    exit 126; # just in case
}

my $istty = -t STDOUT;
my @log = ();
my ($gpasses, $gfails) = (0,0);

sub bigkill($)
{
    my $pid = shift;
    
    if (@log) {
	print "\n" . join("\n", @log) . "\n";
    }
    
    print STDERR "\n! Killed by signal    FAILED\n";

    ($pid > 0) || die("pid is '$pid'?!\n");

    local $SIG{CHLD} = sub { }; # this will wake us from sleep() faster
    kill 15, $pid;
    sleep(2);
    
    if ($pid > 1) {
	kill 9, -$pid;
    }
    kill 9, $pid;
    
    exit(125);
}

# parent
local $SIG{INT} = sub { bigkill($pid); };
local $SIG{TERM} = sub { bigkill($pid); };
local $SIG{ALRM} = sub { 
    print STDERR "Alarm timed out!  No test results for too long.\n";
    bigkill($pid);
};

sub colourize($)
{
    my $result = shift;
    my $pass = ($result eq "ok");
    
    if ($istty) {
	my $colour = $pass ? "\e[32;1m" : "\e[31;1m";
	return "$colour$result\e[0m";
    } else {
	return $result;
    }
}

sub resultline($$)
{
    my ($name, $result) = @_;
    return sprintf("! %-65s %s", $name, colourize($result));
}

my $insection = 0;

while (<$fh>)
{
    chomp;
    s/\r//g;
    
    if (/^\s*Testing "(.*)" in (.*):\s*$/)
    {
        alarm(120);
    
	my ($sect, $file) = ($1, $2);
	
	if ($insection) {
	    printf " %s\n", colourize("ok");
	}
	
	printf("! %s  %s: ", $file, $sect);
	@log = ();
	$insection = 1;
    }
    elsif (/^!\s*(.*?)\s+(\S+)\s*$/)
    {
        alarm(120);
    
	my ($name, $result) = ($1, $2);
	my $pass = ($result eq "ok");
	
	if (!$insection) {
	    printf("\n! Startup: ");
	}
	$insection++;
	
	push @log, resultline($name, $result);
	
	if (!$pass) {
	    $gfails++;
	    if (@log) {
		print "\n" . join("\n", @log) . "\n";
		@log = ();
	    }
	} else {
	    $gpasses++;
	    print ".";
	}
    }
    else
    {
	push @log, $_;
    }
}

if ($insection) {
    printf " %s\n", colourize("ok");
}

my $newpid = waitpid($pid, 0);
if ($newpid != $pid) {
    die("waitpid returned '$newpid', expected '$pid'\n");
}

my $code = $?;
my $ret = ($code >> 8);

if ($ret && @log) {
    print "\n" . join("\n", @log) . "\n";
}


my $gtotal = $gpasses+$gfails;
printf("\nWvTest: %d test%s, %d failure%s.\n",
    $gtotal, $gtotal==1 ? "" : "s",
    $gfails, $gfails==1 ? "" : "s");
print STDERR "\nWvTest result code: $ret\n";
exit( $ret ? $ret : ($gfails ? 125 : 0) );
