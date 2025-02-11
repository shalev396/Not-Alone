# tests/group1/test_1_g1.py
import pytest
import allure
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from src.util import wait_for_element, pass_disclaimer


@allure.story("title Validation")
def test_1_title(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    assert "Not Alone" in driver.title, "❌ Page title does not contain 'Not Alone'"

@allure.story("dialog appear Validation")
def test_2_donate_dialog(driver):
    driver.get("https://notalonesoldier.com/")
    pass_disclaimer(driver)
    
    # Click donate button and verify it exists
    donate_button = wait_for_element(driver, "landing", "button_donate_dialog")
    assert donate_button is not None, "❌ Donate button not found"
    donate_button.click()
    
    # Verify dialog appears
    dialog = wait_for_element(driver, "landing", "div_donate_dialog")
    assert dialog is not None, "❌ Donate dialog did not appear"


