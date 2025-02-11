import importlib
from time import sleep

import allure
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from typing import Dict, List, Tuple, Optional
import allure
from typing import List, Tuple
from selenium.webdriver.support.ui import Select

# important do not delete
from src.pages.landing.locators import LOCATORS


@allure.step("skip disclaimer")
def pass_disclaimer(driver):
    wait_for_element(driver, "landing", "Button_disclaimer_just_looking_around").click()


@allure.step("Check if {element_name} exists")
def wait_for_element(driver, page, element_name, timeout=2):
    """
    Dynamically imports the locators from pages/<page>/locators.py,
    finds the specified element by name, and waits up to `timeout` seconds
    for it to be visible on the page. Returns the element if found,
    otherwise None.

    :param driver:       Selenium WebDriver instance.
    :param page:         The folder name under 'pages' (e.g. 'landing').
    :param element_name: The 'name' key in that page's locators list.
    :param timeout:      How long to wait for the element to appear (in seconds).
    :return:             The located WebElement if visible within `timeout`,
                         otherwise None.
    """
    try:
        # Dynamically import the locators module for the given page
        locators_module = importlib.import_module(f"src.pages.{page}.locators")
        # Get the LOCATORS list from that module
        locators = getattr(locators_module, "LOCATORS", [])

        # Find the matching locator by name
        path = None
        for locator in locators:
            if locator.get("name") == element_name:
                path = locator.get("xpath")
                break
        print(path)
        # If no matching locator was found, return None immediately
        if not path:
            return None

        # Wait until the element is visible
        element=WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((By.XPATH, path))
        )

        assert element, "❌ failed to find element"
        return element
    except TimeoutException:
        return None


# Test cases for different validation modes
VALIDATION_TEST_CASES: Dict[str, List[Tuple[str, Optional[str]]]] = {
    "name": [
        ("a", "Name must be at least 2 characters"),
        ("a" * 51, "Name must be less than 50 characters"),
        ("John123", "Name can only contain letters, spaces, hyphens, and apostrophes"),
        ("John@Doe", "Name can only contain letters, spaces, hyphens, and apostrophes"),
        ("John Doe", None),  # Valid
        ("Mary-Jane", None),  # Valid
        ("O'Connor", None),  # Valid
    ],
    "email": [
        ("", "Email is required"),
        ("notanemail", "Invalid email address"),
        ("missing@", "Invalid email address"),
        ("@missing.com", "Invalid email address"),
        ("valid@email.com", None),  # Valid
        ("user.name+tag@example.co.uk", None),  # Valid
    ],
    "phone": [
        ("123", "Phone number must be 10 digits"),
        ("abcdefghij", "Phone number must contain only digits"),
        ("123456789", "Phone number must be 10 digits"),
        ("1234567890", None),  # Valid
    ],
    "cardNumber": [
        ("123", "Card number must be 16 digits"),
        ("abcd" * 4, "Card number must be 16 digits"),
        ("1234567890123456", None),  # Valid
    ],
    "cardName": [
        ("a", "Name must be at least 2 characters"),
        ("a" * 51, "Name must be less than 50 characters"),
        ("John123", "Name can only contain letters, spaces, hyphens, and apostrophes"),
        ("John@Doe", "Name can only contain letters, spaces, hyphens, and apostrophes"),
        ("John Doe", None),  # Valid
    ],
    "cardExpMonth": [
        ("01", None),  # Valid
        ("", "Required"),
        ("12", None),  # Valid
    ],
    "cardExpYear": [
        ("2030", None),  # Valid
        ("", "Required"),
    ],
    "cvc": [
        ("12", "CVC must be 3 digits"),
        ("abc", "CVC must be 3 digits"),
        ("123", None),  # Valid
    ],
    "password": [
        ("short", "Password must be at least 8 characters"),
        ("onlylowercase", "Password must contain at least one uppercase letter"),
        ("ONLYUPPERCASE", "Password must contain at least one lowercase letter"),
        ("NoNumbers!", "Password must contain at least one number"),
        ("NoSpecial1", "Password must contain at least one special character"),
        ("Valid1Password!", None),  # Valid
    ],
    "url": [
        ("notaurl", "Invalid URL"),
        ("http:/missing.com", "Invalid URL"),
        ("http://example.com", None),  # Valid
        ("https://sub.example.co.uk/path", None),  # Valid
    ],
    "date": [
        ("notadate", "Invalid date format"),
        ("13/13/2023", "Invalid date"),
        ("2023-13-13", "Invalid date"),
        ("2023-12-31", None),  # Valid
        ("2023/12/31", None),  # Valid
    ],
    "postalCode": [
        ("123", "Invalid postal code format"),
        ("ABCDEF", "Invalid postal code format"),
        ("12345", None),  # Valid US
        ("A1A 1A1", None),  # Valid Canadian
    ]
}


@allure.step("Test validation for {input_element}")
def validate_input(driver, page: str, input_element: str, error_element: str, mode: str) -> List[Tuple[bool, str]]:
    """
    Validates an input field using predefined test cases based on the validation mode.
    Handles both text inputs and select elements.

    :param driver: Selenium WebDriver instance
    :param page: The page name (e.g., 'landing')
    :param input_element: The name of the input element in locators
    :param error_element: The name of the error message element in locators
    :param mode: Validation mode (e.g., 'email', 'phone', 'cardNumber', etc.)
    :return: List of (success, error_message) tuples for each test case
    """
    if mode not in VALIDATION_TEST_CASES:
        return [(False, f"Unknown validation mode: {mode}")]

    results = []

    for test_value, expected_error in VALIDATION_TEST_CASES[mode]:
        with allure.step(f"Validating input '{test_value}' for mode '{mode}'"):
            # Find and verify input field
            input_field = wait_for_element(driver, page, input_element)
            if not input_field:
                results.append((False, f"Input field not found for test value: {test_value}"))
                continue

            try:
                # Check if element is a select or input
                tag_name = input_field.tag_name.lower()

                if tag_name == 'select':
                    # Handle select element
                    select = Select(input_field)
                    select.select_by_value(test_value)
                else:
                    # Handle regular input
                    driver.execute_script("arguments[0].value = '';", input_field)
                    input_field.clear()
                    input_field.send_keys(test_value)

                # Trigger validation by unfocusing
                driver.execute_script("arguments[0].blur();", input_field)

            except Exception as e:
                results.append((False, f"Failed to interact with input for {test_value}: {str(e)}"))
                continue

            # Check for error message if expected
            error_element_obj = wait_for_element(driver, page, error_element)

            with allure.step(f"Checking error message for input '{test_value}'"):
                if expected_error:
                    if not error_element_obj:
                        results.append((False, f"Error message element not found for test value: {test_value}"))
                        continue

                    actual_error = error_element_obj.text

                    with allure.step(f"Comparing expected '{expected_error}' with actual '{actual_error}'"):
                        if actual_error != expected_error:
                            results.append((False,
                                            f"Input: {test_value}, Expected error: '{expected_error}' but got: '{actual_error}'"))
                            continue
                else:
                    # For valid inputs, verify no error message is shown
                    if error_element_obj and error_element_obj.is_displayed():
                        results.append(
                            (False, f"Unexpected error message for valid input {test_value}: {error_element_obj.text}"))
                        continue

            results.append((True, None))

    return results