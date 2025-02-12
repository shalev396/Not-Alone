# tests/group1/test_1_g1.py
import pytest
import allure
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from src.util import wait_for_element, pass_disclaimer


@allure.story("title Validation")
def test_1_title(driver):
    driver.get("https://notalonesoldier.com/login")
    assert "Not Alone" in driver.title, "❌ Page title does not contain 'Not Alone'"

@allure.story("all elements appear Validation")
def test_2_login_form(driver):
    driver.get("https://notalonesoldier.com/login")
    # Click donate button and verify it exists
    input_email = wait_for_element(driver, "login", "input_email_login_form")
    assert input_email is not None, "❌ Donate button not found"
    input_password = wait_for_element(driver, "login", "input_password_login_form")
    assert input_password is not None, "❌ Donate button not found"
    button_forgot_password = wait_for_element(driver, "login", "button_forgot_password")
    assert button_forgot_password is not None, "❌ Donate button not found"
    button_sign_up = wait_for_element(driver, "login", "button_sign_up")
    assert button_sign_up is not None, "❌ Donate button not found"
    button_sign_in = wait_for_element(driver, "login", "button_sign_in_form")
    assert button_sign_in is not None, "❌ Donate button not found"
    button_home = wait_for_element(driver, "login", "button_home_redirect")
    assert button_home is not None, "❌ Donate button not found"

