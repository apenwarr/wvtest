#ifndef __WVTEST_CS_H // Blank lines in this file mess up line numbering!
#define __WVTEST_CS_H
#define WVASSERT(x) try { WvTest.test(WvTest.booleanize(x), __FILE__, __LINE__, #x); } catch (Wv.Test.WvAssertionFailure) { throw; } catch (System.Exception) { WvTest.test_exception(__FILE__, __LINE__, #x); throw; }
#define WVPASS(x) WVASSERT(x)
#define WVFAIL(x) try { WvTest.test(!WvTest.booleanize(x), __FILE__, __LINE__, "NOT(" + #x + ")"); } catch (Wv.Test.WvAssertionFailure) { throw; } catch (System.Exception) { WvTest.test_exception(__FILE__, __LINE__, "NOT(" + #x + ")"); throw; }
#define WVEXCEPT(x) { System.Exception _wvex = null; try { x; } catch (System.Exception _wvasserte) { _wvex = _wvasserte; } WvTest.test(_wvex != null, __FILE__, __LINE__, "EXCEPT(" + #x + ")"); if (_wvex != null) throw _wvex; }
#define WVPASSEQ(x, y) try { WvTest.test_eq((x), (y), __FILE__, __LINE__, #x, #y); } catch (Wv.Test.WvAssertionFailure) { throw; } catch (System.Exception) { WvTest.test_exception(__FILE__, __LINE__, string.Format("[{0}] == [{1}]", #x, #y)); throw; }
#define WVPASSNE(x, y) try { WvTest.test_ne((x), (y), __FILE__, __LINE__, #x, #y); } catch (Wv.Test.WvAssertionFailure) { throw; } catch (System.Exception) { WvTest.test_exception(__FILE__, __LINE__, string.Format("[{0}] != [{1}]", #x, #y)); throw; }
#endif // __WVTEST_CS_H
