#!/bin/bash
set -e
pushd $( dirname "${BASH_SOURCE[0]}" )/.. > /dev/null
source "./scripts/utils.sh"

activate_venv .venv_dev

python -m pip install --upgrade pip > /dev/null
pip install --upgrade -r config/requirements_dev.txt > /dev/null

echo "Do you want to make changes to files inplace? [Y/n]"
read answer
if [[ $answer == Y || $answer == y ]]
then
    option="-i" 
else
    option="-d"
fi

autopep8 $option -r --exclude=.venv,.venv_dev -a .

deactivate
popd > /dev/null