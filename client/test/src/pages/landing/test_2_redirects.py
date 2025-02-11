import pytest
import allure
from time import sleep
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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
@allure.story("Privacy Policy redirect Validation")
def test_privacy_policy_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_privacy_policy")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url=="https://notalonesoldier.com/privacypolicy","❌ Wrong URL"
@allure.story("Terms of Service redirect Validation")
def test_terms_of_service_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_terms_of_service")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url=="https://notalonesoldier.com/termsofservice","❌ Wrong URL"
@allure.story("Licenses redirect Validation")
def test_licenses_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_licenses")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url == "https://notalonesoldier.com/licenses", "❌ Wrong URL"
@allure.story("Shalev Github redirect Validation")
def test_shalev_github_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_shalev_github")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url == "https://github.com/shalev396", "❌ Wrong URL"
@allure.story("Liav Github redirect Validation")
def test_liav_github_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_liav_github")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url == "https://github.com/liavbenshimon", "❌ Wrong URL"
@allure.story("Nathan Github redirect Validation")
def test_nathan_github_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_nathan_github")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url == "https://github.com/NathKilin", "❌ Wrong URL"
@allure.story("Leopoldo Github redirect Validation")
def test_leopoldo_github_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_leopoldo_github")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url == "https://github.com/leoMirandaa", "❌ Wrong URL"
@allure.story("Licenses redirect from footer Validation")
def test_licenses_from_footer_a(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    element = wait_for_element(driver, "landing", "a_licenses_from_footer")
    # Scroll element into view and add a small wait
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element)
    # sleep(2)  # Wait for scroll to complete
    # Use JavaScript click instead of Selenium click
    driver.execute_script("arguments[0].click();", element)
    assert driver.current_url == "https://notalonesoldier.com/licenses", "❌ Wrong URL"