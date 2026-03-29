# Allure Pytest
## install Allure
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

allure --version

## .venv
python -m venv .venv 

.venv/bin/activate 

python.exe -m pip install --upgrade pip

pip install -r requirements.txt
# Or from client/: npx tsx test/scripts/run-e2e.ts install

## Run (from client/, API + Vite already running)
# npm run test:headless  — headless Chrome
# npm run test:headed    — visible browser

# CI starts Server + client dev servers in GitHub Actions, waits 30s, then runs the same script headless.

use run_tests.batz
