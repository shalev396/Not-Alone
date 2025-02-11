from time import sleep

import pytest
import allure
from src.util import wait_for_element, validate_input,pass_disclaimer
@allure.step("open payment dialog")
def open_payment_dialog(driver):
    """Helper function to open the payment dialog"""
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    donate_button = wait_for_element(driver, "landing", "button_donate_dialog")
    assert donate_button is not None, "❌ Donate button not found"
    donate_button.click()
    dialog = wait_for_element(driver, "landing", "div_donate_dialog")
    assert dialog is not None, "❌ Donate dialog did not appear"

@allure.feature("Payment Form Validation")
class TestPaymentForm:
    
    @allure.story("Card Name Validation")
    def test_card_name_validation(self, driver):
        open_payment_dialog(driver)
        results = validate_input(
            driver=driver,
            page="landing",
            input_element="input_name_donate_dialog",
            error_element="error_message_name",
            mode="cardName"
        )
        for success, error in results:
            assert success, error

    @allure.story("Card Number Validation")
    def test_card_number_validation(self, driver):
        open_payment_dialog(driver)
        results = validate_input(
            driver=driver,
            page="landing",
            input_element="input_card_number_donate_dialog",
            error_element="error_message_card_number",
            mode="cardNumber"
        )
        for success, error in results:
            assert success, error

    @allure.story("Expiry Month Validation")
    def test_expiry_month_validation(self, driver):
        open_payment_dialog(driver)
        results = validate_input(
            driver=driver,
            page="landing",
            input_element="select_expiry_month_donate_dialog",
            error_element="error_message_expiry_month",
            mode="cardExpMonth"
        )
        for success, error in results:
            assert success, error

    @allure.story("Expiry Year Validation")
    def test_expiry_year_validation(self, driver):
        open_payment_dialog(driver)
        results = validate_input(
            driver=driver,
            page="landing",
            input_element="select_expiry_year_donate_dialog",
            error_element="error_message_expiry_year",
            mode="cardExpYear"
        )
        for success, error in results:
            assert success, error

    @allure.story("CVC Validation")
    def test_cvc_validation(self, driver):
        open_payment_dialog(driver)
        results = validate_input(
            driver=driver,
            page="landing",
            input_element="input_cvc_donate_dialog",
            error_element="error_message_cvc",
            mode="cvc"
        )
        for success, error in results:
            assert success, error
    @allure.story("Card Form Validation")
    def test_card(self,driver):
        open_payment_dialog(driver)
        wait_for_element(driver,"landing","input_name_donate_dialog").send_keys("Jone Due")
        wait_for_element(driver,"landing","input_card_number_donate_dialog").send_keys("1234567890123456")
        wait_for_element(driver,"landing","select_expiry_month_donate_dialog").send_keys("1")
        wait_for_element(driver, "landing", "select_expiry_year_donate_dialog").send_keys("2026")
        wait_for_element(driver, "landing", "input_cvc_donate_dialog").send_keys("123")
        wait_for_element(driver, "landing", "button_submit_donate_dialog").submit()
        sleep(5)
