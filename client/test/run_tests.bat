@echo off
cd /d %~dp0

:: Activate virtual environment
call .venv\Scripts\activate

:: Run pytest and store results in allure-results
pytest --alluredir=allure-results

 echo Opening Allure report...
allure serve allure-results

