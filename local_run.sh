#!/bin/bash

set -e
pushd $( dirname "${BASH_SOURCE[0]}" )/src/local_service/scripts > /dev/null
nohup ./run_devserver.sh > /dev/null 2>&1 &
popd > /dev/null
