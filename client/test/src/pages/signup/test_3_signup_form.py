from time import sleep

import pytest
import allure
from src.util import wait_for_element, validate_input,pass_disclaimer
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@allure.step("open signup form")
def open_signup_form(driver):
    """Helper function to open the signup form"""
    driver.get("https://notalonesoldier.com/signup")
    assert driver.current_url == "https://notalonesoldier.com/signup", "❌ Wrong URL"

@allure.feature("Signup Form Validation")
class TestSignupForm:
    
    @allure.story("First Name Validation")
    def test_first_name_validation(self, driver):
        open_signup_form(driver)
        results = validate_input(
            driver=driver,
            page="signup",
            input_element="input_first_name_sign_up_form",
            error_element="p_error_first_name_sign_up_form",
            mode="name"
        )
        for success, error in results:
            assert success, error

    @allure.story("Last Name Validation")
    def test_last_name_validation(self, driver):
        open_signup_form(driver)
        results = validate_input(
            driver=driver,
            page="signup",
            input_element="input_last_name_sign_up_form",
            error_element="p_error_last_name_sign_up_form",
            mode="name"
        )
        for success, error in results:
            assert success, error

    @allure.story("Email Validation")
    def test_email_validation(self, driver):
        open_signup_form(driver)
        results = validate_input(
            driver=driver,
            page="signup",
            input_element="input_email_sign_up_form",
            error_element="p_error_email_sign_up_form",
            mode="email"
        )
        for success, error in results:
            assert success, error

    @allure.story("Password Validation")
    def test_password_validation(self, driver):
        open_signup_form(driver)
        results = validate_input(
            driver=driver,
            page="signup",
            input_element="input_password_sign_up_form",
            error_element="p_error_password_sign_up_form",
            mode="password"
        )
        for success, error in results:
            assert success, error

    @allure.story("Phone Validation")
    def test_phone_validation(self, driver):
        open_signup_form(driver)
        results = validate_input(
            driver=driver,
            page="signup",
            input_element="input_phone_sign_up_form",
            error_element="p_error_phone_sign_up_form",
            mode="phone"
        )
        for success, error in results:
            assert success, error

    @allure.story("Passport Validation")
    def test_passport_validation(self, driver):
        open_signup_form(driver)
        results = validate_input(
            driver=driver,
            page="signup",
            input_element="input_passport_sign_up_form",
            error_element="p_error_passport_sign_up_form",
            mode="passport"
        )
        for success, error in results:
            assert success, error

    @allure.story("Form Submission Success")
    def test_successful_signup(self, driver):
        open_signup_form(driver)
        
        # Fill in all required fields with valid data
        wait_for_element(driver, "signup", "input_first_name_sign_up_form").send_keys("John")
        wait_for_element(driver, "signup", "input_last_name_sign_up_form").send_keys("Doe")
        wait_for_element(driver, "signup", "input_email_sign_up_form").send_keys("john.doe@example.com")
        wait_for_element(driver, "signup", "input_password_sign_up_form").send_keys("Password123")
        wait_for_element(driver, "signup", "input_confirmPassword_sign_up_form").send_keys("Password123")
        wait_for_element(driver, "signup", "input_phone_sign_up_form").send_keys("+1234567890")
        wait_for_element(driver, "signup", "input_passport_sign_up_form").send_keys("AB123456")
        
        # Select account type
        type_select = wait_for_element(driver, "signup", "input_type_sign_up_form")
        type_select.click()
        type_select.send_keys("Soldier")
        
        # Submit the form
        wait_for_element(driver, "signup", "button_create_account").click()
        
        # Wait for redirect to 2FA setup
        wait = WebDriverWait(driver, 2)
        wait.until(EC.url_contains("/2fa"))
        
        assert driver.current_url=="https://notalonesoldier.com/2fa", "❌ Failed to redirect to 2FA setup"
