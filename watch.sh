#!/bin/bash
when-changed -r -v -1 ./raw -c node ./compile.js %f
