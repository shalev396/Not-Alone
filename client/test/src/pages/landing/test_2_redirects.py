import pytest
import allure

from src.util import wait_for_element, pass_disclaimer


@allure.story("Login redirect Validation")
def test_login_button(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    wait_for_element(driver, "landing", "button_login_page").click()
    assert driver.current_url=="https://notalonesoldier.com/login","❌ Wrong URL"

@allure.story("Sign up redirect Validation")
def test_sign_up_button(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    wait_for_element(driver, "landing", "button_sign_up_page").click()
    assert driver.current_url=="https://notalonesoldier.com/signup","❌ Wrong URL"
