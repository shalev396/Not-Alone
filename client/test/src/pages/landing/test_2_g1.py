# tests/group1/test_2_g1.py
import pytest
import allure


@allure.step("Test if title is correct 2")
def test_example_2(driver):
    driver.get("https://notalonesoldier.com/")
    assert "Not1 Alone" in driver.title
