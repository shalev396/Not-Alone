# tests/group1/test_1_g1.py
import pytest
import allure
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from src.util import wait_for_element, pass_disclaimer


@allure.story("title Validation")
def test_1_title(driver):
    driver.get("https://notalonesoldier.com/signup")
    assert "Not Alone" in driver.title, "❌ Page title does not contain 'Not Alone'"

@allure.story("all elements appear Validation")
def test_2_sign_up_form(driver):
    driver.get("https://notalonesoldier.com/signup")
    # Click donate button and verify it exists
    input_first_name = wait_for_element(driver, "signup", "input_first_name_sign_up_form")
    assert input_first_name is not None, "❌ Donate button not found"
    input_last_name = wait_for_element(driver, "signup", "input_last_name_sign_up_form")
    assert input_last_name is not None, "❌ Donate button not found"
    input_passport = wait_for_element(driver, "signup", "input_passport_sign_up_form")
    assert input_passport is not None, "❌ Donate button not found"
    input_phone = wait_for_element(driver, "signup", "input_phone_sign_up_form")
    assert input_phone is not None, "❌ Donate button not found"
    input_email = wait_for_element(driver, "signup", "input_email_sign_up_form")
    assert input_email is not None, "❌ Donate button not found"
    input_password = wait_for_element(driver, "signup", "input_password_sign_up_form")
    assert input_password is not None, "❌ Donate button not found"
    input_confirmPassword = wait_for_element(driver, "signup", "input_confirmPassword_sign_up_form")
    assert input_confirmPassword is not None, "❌ Donate button not found"
    input_type = wait_for_element(driver, "signup", "input_type_sign_up_form")
    assert input_type is not None, "❌ Donate button not found"
    button_terms_of_service = wait_for_element(driver, "signup", "button_terms_of_service")
    assert button_terms_of_service is not None, "❌ Donate button not found"
    button_privacy_policy = wait_for_element(driver, "signup", "button_privacy_policy")
    assert button_privacy_policy is not None, "❌ Donate button not found"
    button_create_account = wait_for_element(driver, "signup", "button_create_account")
    assert button_create_account is not None, "❌ Donate button not found"
    button_back_to_home = wait_for_element(driver, "signup", "button_back_to_home")
    assert button_back_to_home is not None, "❌ Donate button not found"
    a_sign_in = wait_for_element(driver, "signup", "a_sign_in")
    assert a_sign_in is not None, "❌ Donate button not found"
