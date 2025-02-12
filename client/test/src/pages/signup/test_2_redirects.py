import pytest
import allure
from time import sleep
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.util import wait_for_element, pass_disclaimer
@allure.story("Terms Of Service redirect Validation")
def test_terms_of_service_button(driver):
    driver.get("https://notalonesoldier.com/signup")
    wait_for_element(driver, "signup", "button_terms_of_service").click()
    assert driver.current_url=="https://notalonesoldier.com/termsofservice","❌ Wrong URL"
@allure.story("Privacy Policy redirect Validation")
def test_privacy_policy_button(driver):
    driver.get("https://notalonesoldier.com/signup")
    wait_for_element(driver, "signup", "button_privacy_policy").click()
    assert driver.current_url=="https://notalonesoldier.com/privacypolicy","❌ Wrong URL"
@allure.story("Sign Up redirect failed Validation")
def test_create_account_button(driver):
    driver.get("https://notalonesoldier.com/signup")
    wait_for_element(driver, "signup", "button_create_account").click()
    assert driver.current_url=="https://notalonesoldier.com/signup","❌ Wrong URL"
@allure.story("Home redirect Validation")
def test_back_to_home_button(driver):
    driver.get("https://notalonesoldier.com/signup")
    wait_for_element(driver, "signup", "button_back_to_home").click()
    assert driver.current_url=="https://notalonesoldier.com/","❌ Wrong URL"
@allure.story("Sign In redirect Validation")
def test_sign_in_a(driver):
    driver.get("https://notalonesoldier.com/signup")
    element=wait_for_element(driver, "signup", "a_sign_in")
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url=="https://notalonesoldier.com/login","❌ Wrong URL"
