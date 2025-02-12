from time import sleep

import pytest
import allure
from src.util import wait_for_element, validate_input,pass_disclaimer
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
@allure.step("open login form")
def open_login_dialog(driver):
    """Helper function to open the payment dialog"""
    driver.get("https://notalonesoldier.com/login")
    assert driver.current_url=="https://notalonesoldier.com/login","❌ Wrong URL"
@allure.feature("Login Form Validation")
class TestLoginForm:
    @allure.story("email Validation")
    def test_email_validation(self, driver):
        open_login_dialog(driver)
        results = validate_input(
            driver=driver,
            page="login",
            input_element="input_email_login_form",
            error_element="p_email_error_massage",
            mode="email"
        )
        for success, error in results:
            assert success, error
    @allure.story("Password Validation")
    def test_password_validation(self, driver):
        open_login_dialog(driver)
        results = validate_input(
            driver=driver,
            page="login",
            input_element="input_password_login_form",
            error_element="p_password_error_massage",
            mode="password"
        )
        for success, error in results:
            assert success, error
    @allure.story("Form Login Failed Validation")
    def test_login_failed(self, driver):
        open_login_dialog(driver)
        wait_for_element(driver,"login","input_email_login_form").send_keys("ssss@sss.com")
        wait_for_element(driver,"login","input_password_login_form").send_keys("12341111")
        wait_for_element(driver,"login","button_sign_in_form").click()
        assert wait_for_element(driver,"login","div_login_error_massage").is_displayed(), "❌ Not showing error"
    @allure.story("Form Login success Validation")
    def test_login_success(self,driver):
        open_login_dialog(driver)
        wait_for_element(driver,"login","input_email_login_form").send_keys("shalev396@admin.com")
        wait_for_element(driver,"login","input_password_login_form").send_keys("12345678")
        wait_for_element(driver,"login","button_sign_in_form").click()
        wait = WebDriverWait(driver, 5)
        wait.until(EC.url_to_be("https://notalonesoldier.com/admin/queue"))
        assert driver.current_url == "https://notalonesoldier.com/admin/queue", "❌ Wrong URL"
        driver.get("https://notalonesoldier.com/logout")

