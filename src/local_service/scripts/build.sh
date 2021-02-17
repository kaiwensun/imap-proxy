#!/bin/bash

VENV=".venv"

set -e
pushd $( dirname "${BASH_SOURCE[0]}" )/.. > /dev/null
source "scripts/utils.sh"
activate_venv "$VENV"

python -m pip install --upgrade pip

# BSD based getopt on mac is weird
args=`getopt d $*` || exit 1
set -- $args
unset dev_mode
for i; do
    case "$i" in
        -d)
            dev_mode="true"
            shift;;
        --)
            shift; break;;
    esac
done

if [ -z "$dev_mode" ]; then
    pip install -r config/requirements.freeze
else
    pip install --upgrade -r config/requirements.txt
    pip freeze > config/requirements.freeze
fi

deactivate
popd > /dev/null
