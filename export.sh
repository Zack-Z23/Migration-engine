#!/bin/bash

if [ "$1" == "-v" ]; then
    XML_HOST_PATH="${2}"
    VERBOSE_FLAG="-v"
else
    XML_HOST_PATH="${1}"
    VERBOSE_FLAG=""
fi

if [ -z "$XML_HOST_PATH" ]; then
    echo "Usage: ./export.sh [-v] /path/to/xml"
    exit 1
fi

ABS_XML_PATH=$(cd "$(dirname "$XML_HOST_PATH")" && pwd)/$(basename "$XML_HOST_PATH")

export HOST_XML_MAPPING="$ABS_XML_PATH"
export APP_ARGS="$VERBOSE_FLAG /data/config.xml"

docker-compose up --build --abort-on-container-exit app
