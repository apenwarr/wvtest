default: all

all: jsshell

MACOS_JS_PATH=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Resources/jsc
NODEJS_BIN=node

jsshell: v8shell.cc
	rm -f $@
	set -e; \
	set -x; \
	if [ -e "${MACOS_JS_PATH}" ]; then \
		ln -sf "${MACOS_JS_PATH}" jsshell; \
	elif ../runnable ${NODEJS_BIN}; then \
		ln -sf nodeshell jsshell; \
	else \
		$(MAKE) v8shell && ln -sf v8shell jsshell; \
	fi

v8shell: v8shell.cc
	g++ -g -o $@ v8shell.cc -lv8

runtests: $(patsubst %.js,%.js.run,$(wildcard t/t*.js))

%.js.run: %.js jsshell
	./jsshell wvtest.js $*.js

test: jsshell
	../wvtestrun $(MAKE) runtests

clean:
	rm -f *~ */*~ v8shell jsshell
	find . -name '*~' -exec rm -f {} \;
