#!/bin/bash
when-changed -r -v -1 ./raw ./helpers ./partials -c node ./compile.js %f
