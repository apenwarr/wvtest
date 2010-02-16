#!/bin/bash
. ./wvtest.sh

WVSTART "main test"
WVPASS true
WVPASS true
WVPASS true
WVFAIL false
WVPASSEQ "$(ls | sort)" "$(ls)"
WVPASSNE "5" "5 "
WVPASSEQ "" ""

WVSTART another test
WVPASS true
