#!/bin/bash
  
activate_venv() {
    venv="$1"
    if [ ! -d "$venv" ]; then
        python3 -m venv "$venv"
    fi
    source "./$venv/bin/activate"
}