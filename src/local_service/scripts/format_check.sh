#!/bin/bash

set -e
pushd $( dirname "${BASH_SOURCE[0]}" )/.. > /dev/null
source "./scripts/utils.sh"

activate_venv .venv_dev

python -m pip install --upgrade pip > /dev/null
pip install --upgrade -r config/requirements_dev.txt > /dev/null

pycodestyle --exclude=.venv,.venv_dev .

deactivate
popd > /dev/null