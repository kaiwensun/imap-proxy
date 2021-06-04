#!/bin/bash

VENV=".venv"

set -e
pushd $( dirname "${BASH_SOURCE[0]}" )/.. > /dev/null
source "./scripts/utils.sh"
if [ ! -d "$VENV" ]; then
    ./scripts/build.sh
fi
activate_venv "$VENV"

python3 dev_server.py

deactivate
popd > /dev/null
