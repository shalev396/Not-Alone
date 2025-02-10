@echo off

setlocal enableextensions
setlocal enabledelayedexpansion

for /f "tokens=2 delims=:." %%a in ('"%SystemRoot%\System32\chcp.com"') do (
    set _OLD_CODEPAGE=%%a
)
if defined _OLD_CODEPAGE (
    "%SystemRoot%\System32\chcp.com" 65001 > nul
)

set PACKAGE_NAME=examples_allure_pytest
set PY_VERSION=3.8
set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%
set VENV_DIR_NAME=.env
if not defined EXPECTED_VENV_DIR (
    set EXPECTED_VENV_DIR=%SCRIPT_DIR%\%VENV_DIR_NAME%
)
set EXIT_CODE=0

if defined VIRTUAL_ENV if not "%VIRTUAL_ENV%"=="%EXPECTED_VENV_DIR%" (
    echo WARNING: The ^"%EXPECTED_VENV_DIR%^" virtual environment will be ^
used instead of ^"%VIRTUAL_ENV%^" which is currently active. If you want to ^
use a different environment, modify the EXPECTED_VENV_DIR variable in this ^
batch file, or pass it as the environment variable: >&2
    echo. >&2
    echo   PS ^> $Env:EXPECTED_VENV_DIR = ^"%VIRTUAL_ENV%^" >&2
    echo   PS ^> .\run.bat >&2
    echo. >&2
)

if not exist "%EXPECTED_VENV_DIR%" (
    py -!PY_VERSION! --version >nul 2>&1
    if !ERRORLEVEL! equ 9009 (
        echo ERROR: Unable to find Python. Make sure the Python launcher for ^
Windows is installed. You can download it here: >&2
        echo. >&2
        echo   https://www.python.org/downloads/ >&2
        echo. >&2
        set EXIT_CODE=1
        goto END
    ) else if !ERRORLEVEL! equ 103 (
        py -3 --version >nul 2>&1

        if !ERRORLEVEL! NEQ 0 (
            echo ERROR: Unable to find Python. Please, install Python ^
!PY_VERSION! or greater and try again. You can download Python here: >&2
            echo. >&2
            echo   https://www.python.org/downloads/ >&2
            echo. >&2
            set EXIT_CODE=1
            goto END
        )

        for /f "delims=" %%i in ('py -3 --version 2^>nul') do (
            set INSTALLED_PY_VERSION=%%i
        )

        for /f "tokens=2 delims=." %%i in ("!PY_VERSION!") do (
            set REQUIRED_MINOR_VERSION=%%i
        )

        for /f "tokens=2 delims=." %%i in ("!INSTALLED_PY_VERSION!") do (
            set INSTALLED_MINOR_VERSION=%%i
        )

        if !INSTALLED_MINOR_VERSION! LSS !REQUIRED_MINOR_VERSION! (
            echo WARNING: the project was generated for Python !PY_VERSION!, ^
but this version isn't installed in the system. The default installed version ^
3.!INSTALLED_MINOR_VERSION! will be used instead, but you need to update the ^
'requires-python' property in pyproject.toml in order to run the project. If a ^
compatibility issue occurs, install a newer version, or set it as the default. ^
Then, delete the !VENV_DIR_NAME! folder and try again. You can download ^
Python here: >&2
            echo. >&2
            echo   https://www.python.org/downloads/ >&2
            echo. >&2
        )

        set PY_VERSION=3.!INSTALLED_MINOR_VERSION!

    ) else if !ERRORLEVEL! neq 0 (
        echo ERROR: failed to find Python. Please, make sure the Python launcher ^
for Windows is installed and accessible. Run the following command to check: >&2
        echo. >&2
        echo   py -3 --version >&2
        echo. >&2
        set EXIT_CODE=1
        goto END
    )

    echo Creating a virtual environment...
    py -!PY_VERSION! -m venv "!EXPECTED_VENV_DIR!"
    if !ERRORLEVEL! neq 0 (
        set EXIT_CODE=1
        goto END
    )
    set NEW_VENV=true

    timeout 3 >nul 2>&1
)

if not "%VIRTUAL_ENV%"=="%EXPECTED_VENV_DIR%" (
    call "!EXPECTED_VENV_DIR!\Scripts\activate.bat" >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo Failed to activate the virtual environment via ^
"!EXPECTED_VENV_DIR!\Scripts\activate.bat" >&2
        set EXIT_CODE=1
        goto END
    )
)

if defined NEW_VENV (
    python -m pip --require-virtualenv install --upgrade pip setuptools wheel
    if !ERRORLEVEL! neq 0 (
        set EXIT_CODE=1
        echo If the error persists, try to run the script as administrator, ^
or manually create a virtual environment in ^"!EXPECTED_VENV_DIR!^": >&2
        echo. >&2
        echo   py -!PY_VERSION! -m venv !VENV_DIR_NAME! >&2
        echo   .\!VENV_DIR_NAME!\Scripts\Activate.ps1 >&2
        echo   python -m pip install --upgrade pip setuptools wheel >&2
        echo. >&2
        timeout 2 >nul 2>&1
        rd /s /q "!EXPECTED_VENV_DIR!"
        goto END
    )
)

pip show "%PACKAGE_NAME%" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    pip --require-virtualenv install --requirement "%SCRIPT_DIR%\requirements.txt"
    if !ERRORLEVEL! neq 0 (
        set EXIT_CODE=1
        goto END
    )

    pip --require-virtualenv install --no-deps --editable "%SCRIPT_DIR%[dev]"
    if !ERRORLEVEL! neq 0 (
        set EXIT_CODE=1
        goto END
    )
)

pytest --alluredir "%SCRIPT_DIR%\allure-results" %*
set EXIT_CODE=%ERRORLEVEL%

:END
if defined _OLD_CODEPAGE (
    "%SystemRoot%\System32\chcp.com" %_OLD_CODEPAGE% > nul
    set _OLD_CODEPAGE=
)
exit EXIT_CODE
