import wvtest


class _Meta(type):
  def __init__(cls, name, bases, attrs):
    type.__init__(cls, name, bases, attrs)
    print 'registering class %r' % name
    for t in dir(cls):
      if t.startswith('test'):
        # TODO(apenwarr): inside a class, sort by source code line number
        print 'registering func %r' % t
        def DefineGo(t):
          def Go():
            o = cls(t)
            o.setUp()
            try:
              getattr(o, t)()
            finally:
              o.tearDown()
          return Go
        wvtest.wvtest(DefineGo(t), getattr(cls, t))


class TestCase():
  __metaclass__ = _Meta

  def __init__(self, testname):
    pass

  def setUp(self):
    pass

  def tearDown(self):
    pass

  def assertTrue(self, a, unused_msg=''):
    return wvtest.WVPASS(a, xdepth=1)

  def assertFalse(self, a, unused_msg=''):
    return wvtest.WVFAIL(a, xdepth=1)

  def assertIs(self, a, b):
    return wvtest.WVPASSIS(a, b, xdepth=1)

  def assertIsNot(self, a, b):
    return wvtest.WVPASSISNOT(a, b, xdepth=1)

  def assertEqual(self, a, b):
    return wvtest.WVPASSEQ(a, b, xdepth=1)

  def assertNotEqual(self, a, b):
    return wvtest.WVPASSNE(a, b, xdepth=1)

  def assertGreaterEqual(self, a, b):
    return wvtest.WVPASSGE(a, b, xdepth=1)

  def assertGreaterThan(self, a, b):
    return wvtest.WVPASSGT(a, b, xdepth=1)

  def assertLessEqual(self, a, b):
    return wvtest.WVPASSLE(a, b, xdepth=1)

  def assertLessThan(self, a, b):
    return wvtest.WVPASSLT(a, b, xdepth=1)

  def assertAlmostEqual(self, a, b, places=7, delta=None):
    return wvtest.WVPASSNEAR(a, b, places=places, delta=delta, xdepth=1)

  def assertNotAlmostEqual(self, a, b, places=7, delta=None):
    return wvtest.WVPASSFAR(a, b, places=places, delta=delta, xdepth=1)

  def assertRaises(self, etype, func=None, *args, **kwargs):
    return wvtest._WVEXCEPT(etype, 0, func, *args, **kwargs)

  assertEquals = assertEqual
  assertNowEquals = assertNotEqual
  assertGreater = assertGreaterThan
  assertLess = assertLessThan

def main():
  wvtest.wvtest_main()
