#!/bin/bash

PACKAGE_NAME="examples_allure_pytest"
PY_VERSION="3.8"
SCRIPT_DIR="$(realpath "$(dirname "${BASH_SOURCE[0]}")")"
VENV_DIR_NAME=.env
EXPECTED_VENV_DIR=${EXPECTED_VENV_DIR:="$SCRIPT_DIR/$VENV_DIR_NAME"}

if [ -n "$VIRTUAL_ENV" ] && [ "$VIRTUAL_ENV" != "$EXPECTED_VENV_DIR" ]
then
    >&2 echo -e "WARNING: The \"$EXPECTED_VENV_DIR\" virtual environment will \
be used instead of \"$VIRTUAL_ENV\" which is currently active. If you want to \
use a different environment, modify the EXPECTED_VENV_DIR variable in this \
script, or pass it as the environment variable:\n\n\
  EXPECTED_VENV_DIR=$VIRTUAL_ENV ./run.sh\n"
fi

if [ ! -d $EXPECTED_VENV_DIR ]
then
    echo "Creating a virtual environment..."

    for x in "python$PY_VERSION" python3 python
    do
        if command -v $x &> /dev/null && $x --version &> /dev/null
        then
            PY_CMD=$x
            break
        fi
    done

    if [ -e "$PY_CMD" ]
    then
        >&2 echo "ERROR: failed to find Python. Please, make sure Python \
$PY_VERSION or greater is available and try again"
        exit 1
    fi

    REQUESTED_MINOR_VERSION=`echo $PY_VERSION | cut -d "." -f 2`
    INSTALLED_MINOR_VERSION=`$PY_CMD --version | cut -d "." -f 2`

    if [ $INSTALLED_MINOR_VERSION -lt $REQUESTED_MINOR_VERSION ]
    then
        >&2 echo "WARNING: the project was generated for Python $PY_VERSION, \
but this version can't be found. The version 3.$INSTALLED_MINOR_VERSION will \
be used instead, but you need to update the 'requires-python' property in \
pyproject.toml in order to run the project. If a compatibility issue occurs, \
install a newer version, or set it as the one behind python3/python commands. \
Then, delete the $VENV_DIR_NAME folder and run the script again"
    fi

    $PY_CMD -m venv "$EXPECTED_VENV_DIR" || exit 1
    NEW_VENV="true"
fi

if [ "$VIRTUAL_ENV" != "$EXPECTED_VENV_DIR" ]
then
    . "$EXPECTED_VENV_DIR/bin/activate" || exit 1
fi

if [ -n "$NEW_VENV" ]
then
    python -m pip --require-virtualenv install --upgrade pip setuptools wheel || exit 1
fi

if ! pip show "$PACKAGE_NAME" &> /dev/null
then
    pip --require-virtualenv install --requirement "$SCRIPT_DIR/requirements.txt" || exit 1
    pip --require-virtualenv install --no-deps --editable "$SCRIPT_DIR[dev]" || exit 1
fi

pytest --alluredir "$SCRIPT_DIR/allure-results" $@
