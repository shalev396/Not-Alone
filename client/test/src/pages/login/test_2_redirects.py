import pytest
import allure
from time import sleep
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.util import wait_for_element, pass_disclaimer
@allure.story("Sign up redirect Validation")
def test_sign_up_button(driver):
    driver.get("https://notalonesoldier.com/login")
    wait_for_element(driver, "login", "button_sign_up").click()
    assert driver.current_url=="https://notalonesoldier.com/signup","❌ Wrong URL"
@allure.story("Forgot Password redirect Validation")
def test_forgot_password_button(driver):
    driver.get("https://notalonesoldier.com/login")
    wait_for_element(driver, "login", "button_forgot_password").click()
    assert driver.current_url=="https://notalonesoldier.com/forgot-password","❌ Wrong URL"
@allure.story("Login redirect failed Validation")
def test_login_button(driver):
    driver.get("https://notalonesoldier.com/login")
    wait_for_element(driver, "login", "button_sign_in_form").click()
    assert driver.current_url=="https://notalonesoldier.com/login","❌ Wrong URL"
@allure.story("Home redirect failed Validation")
def test_home_button(driver):
    driver.get("https://notalonesoldier.com/login")
    wait_for_element(driver, "login", "button_home_redirect").click()
    assert driver.current_url=="https://notalonesoldier.com/","❌ Wrong URL"