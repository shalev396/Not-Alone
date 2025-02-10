# tests/group1/test_1_g1.py
import pytest
import allure


@allure.step("Test if title is correct")
def test_example_1(driver):
    driver.get("https://notalonesoldier.com/")
    assert "Not Alone" in driver.title
