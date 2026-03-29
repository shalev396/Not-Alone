import pytest
import allure
from time import sleep
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from src.base_url import site, urls_match
from src.util import wait_for_element, pass_disclaimer
@allure.story("Terms Of Service redirect Validation")
def test_terms_of_service_button(driver):
    driver.get(site("/signup"))
    wait_for_element(driver, "signup", "button_terms_of_service").click()
    assert urls_match(driver.current_url, "/termsofservice"), "❌ Wrong URL"
@allure.story("Privacy Policy redirect Validation")
def test_privacy_policy_button(driver):
    driver.get(site("/signup"))
    wait_for_element(driver, "signup", "button_privacy_policy").click()
    assert urls_match(driver.current_url, "/privacypolicy"), "❌ Wrong URL"
@allure.story("Sign Up redirect failed Validation")
def test_create_account_button(driver):
    driver.get(site("/signup"))
    wait_for_element(driver, "signup", "button_create_account").click()
    assert urls_match(driver.current_url, "/signup"), "❌ Wrong URL"
@allure.story("Home redirect Validation")
def test_back_to_home_button(driver):
    driver.get(site("/signup"))
    wait_for_element(driver, "signup", "button_back_to_home").click()
    assert urls_match(driver.current_url, "/"), "❌ Wrong URL"
@allure.story("Sign In redirect Validation")
def test_sign_in_a(driver):
    # Anonymous visitor: clear persisted auth so "Sign in" goes to /login, not /admin/queue
    driver.delete_all_cookies()
    driver.execute_script("try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}")
    driver.get(site("/signup"))
    element = wait_for_element(driver, "signup", "a_sign_in")
    driver.execute_script("arguments[0].click();", element)
    assert urls_match(driver.current_url, "/login"), "❌ Wrong URL"
