#!/bin/sh
. ./wvtest.sh

WVSTART "main test"
WVPASS true
WVPASS true
WVPASS true
WVFAIL false
WVXFAIL false
WVXFAIL true
WVSKIP non-existent
WVPASSEQ "$(ls | sort)" "$(ls)"
WVPASSNE "5" "5 "
WVPASSEQ "" ""
(echo nested test; true); WVPASSRC $?
(echo nested fail; false); WVFAILRC $?

WVSTART another test
WVPASS true
