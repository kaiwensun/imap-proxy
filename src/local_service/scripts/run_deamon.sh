#!/bin/bash

set -e
pushd $( dirname "${BASH_SOURCE[0]}" )/.. > /dev/null
nohup ./scripts/run_devserver.sh > /dev/null 2>&1 &
popd > /dev/null
