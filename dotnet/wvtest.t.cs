/*
 * Versaplex:
 *   Copyright (C)2007-2008 Versabanq Innovations Inc. and contributors.
 *       See the included file named LICENSE for license information.
 */
#include "wvtest.cs.h"
using System;
using Wv.Test;

[TestFixture]
public class WvTestTest
{
 	[Test] public void test_wvtest()
	{
	    WVPASS(1);
	    WVPASS("hello");
	    WVPASS(new Object());
	    WVPASS(0 != 1);
	    
	    WVFAIL(0);
	    WVFAIL("");
	    WVFAIL(null);
	    
	    WVPASSEQ(7, 7);
	    WVPASSEQ("foo", "foo");
	    WVPASSEQ("", "");
	    Object obj = new Object();
	    WVPASSEQ(obj, obj);
	    WVPASSEQ(null, null);
	    
	    WVPASSNE(7, 8);
	    WVPASSNE("foo", "blue");
	    WVPASSNE("", "notempty");
	    WVPASSNE(null, "");
	    WVPASSNE(obj, null);
	    WVPASSNE(obj, new Object());
	    WVPASSNE(new Object(), new Object());
	}   
    
	// these are only public to get rid of the "not assigned to" warnings.
	// we don't assign to them because that's the whole point of the test.
	public DateTime null_date;
	public TimeSpan null_span;
	
	[Test] public void test_dates_and_spans()
	{
	    WVPASS(null_date == DateTime.MinValue);
	    WVPASSEQ(null_date, DateTime.MinValue);
	    WVPASS(null_span == TimeSpan.Zero);
	    WVPASSEQ(null_span, TimeSpan.Zero);
	    
	    TimeSpan t = TimeSpan.FromMinutes(60*24*7);
	    WVPASSEQ(t.ToString(), "7.00:00:00");
	    WVPASSEQ(t.Ticks, 7*24*60*60*10000000L);
	    WVPASS(t.TotalMinutes == 7*24*60);
	    WVPASSEQ(t.TotalMinutes, 7*24*60);
	    WVPASSEQ(t.TotalSeconds, 7*24*60*60);
	    WVPASSEQ(t.Minutes, 0);
	}

	void throw_exception()
	{
	    throw new System.Exception("Exception thrown");
	}
	void no_throw_exception()
	{
	    return;
	}

	[Test] public void test_exceptions()
	{
	    bool caught = false;

	    try {
		WVEXCEPT(throw_exception());
	    } catch (Wv.Test.WvAssertionFailure e) {
		throw e;
	    } catch (System.Exception) {
		caught = true;
	    }

	    WVPASS(caught);

	    caught = false;

	    System.Console.WriteLine("Ignore next failure: it is expected");
	    WvTest.expect_next_failure();
	    try {
		WVEXCEPT(no_throw_exception());
	    } catch (Wv.Test.WvAssertionFailure) {
		caught = true;
	    }

	    WVPASS(caught);
	}
}
