#!/bin/bash

kill `ps aux | grep 'Python dev_server.py' | grep -v grep | awk '{print $2}'`
