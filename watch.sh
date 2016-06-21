#!/bin/bash
when-changed -r -v -1 ./raw ./helpers -c node ./compile.js %f
