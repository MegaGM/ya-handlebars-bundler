#!/bin/bash
when-changed -r -v -1 ./raw node ./compile.js %f
exit(0)
