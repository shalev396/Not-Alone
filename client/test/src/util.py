import importlib
from time import sleep
import requests

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
    for it to be visible on the page. If found, scrolls to the element.
    Returns the element if found, otherwise None.

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
        element = WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((By.XPATH, path))
        )

        assert element, "❌ failed to find element"
        
        # Scroll the element into view with instant behavior
        try:
            driver.execute_script(
                "arguments[0].scrollIntoView({block: 'center', inline: 'center'});",
                element
            )
            sleep(0.2)
        except Exception as e:
            print(f"Warning: Could not scroll to element {element_name}: {str(e)}")
            
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
        ("", "Required"),
        ("notanemail", "Invalid email format"),
        ("missing@", "Invalid email format"),
        ("@missing.com", "Invalid email format"),
        ("valid@email.com", None),  # Valid
        ("user.name+tag@example.co.uk", None),  # Valid
    ],
    "phone": [
        ("123", "Invalid phone format"),
        ("abcdefghij", "Invalid phone format"),
        ("123456789", "Invalid phone format"),
        ("+1234567890", None),  # Valid
        ("+44 1234567890", None),  # Valid with spaces
        ("+972-123456789", None),  # Valid with hyphen
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
        ("short", "Password must be at least 6 characters"),
        # ("onlylowercase", "Password must contain at least one uppercase letter"),
        # ("ONLYUPPERCASE", "Password must contain at least one lowercase letter"),
        # ("NoNumbers!", "Password must contain at least one number"),
        # ("NoSpecial1", "Password must contain at least one special character"),
        ("Valid1Password", None),  # Valid
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
    ],
    "passport": [
        ("", "Required"),
        ("AB123456", None),  # Valid
        ("123456789", None),  # Valid
    ],
   
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


def get_admin_login_token():
    # Prepare the login payload
    payload = {
        "email": "shalev396@admin.com",
        "password": "12345678"
    }

    # Send a POST request to the login endpoint
    url = "https://notalonesoldier.com/api/auth/login"
    response = requests.post(url, json=payload)
    # Raise an exception if the request returned an error status
    response.raise_for_status()
    # Parse the response JSON
    data = response.json()
    # Extract the 'token' field from the response
    # Assuming the returned JSON looks like:
    # {
    #   "token": "...",
    #   "user": { ... }
    # }
    token = data["token"]
    # Return the token
    return token


def delete_user(token, user_id):
    """
    Sends a DELETE request to delete a user by user_id.

    Args:
        token (str): The JWT or auth token to place in the header.
        user_id (str): The ID of the user to delete.

    Returns:
        dict: The JSON response from the server (if any).
    """

    url = f"https://notalonesoldier.com/api/users/{user_id}"

    # If your API literally expects "Burner <token>" in the header,
    # change 'Bearer' to 'Burner'.
    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.delete(url, headers=headers)

    # Raise an exception if an error (4xx or 5xx) occurs
    response.raise_for_status()

    # Return whatever JSON the endpoint might provide upon deletion
    # If there's no body, this line may cause an error; handle as needed.
    return response.json()
def get_session_storage_value(driver, key):
    """
    Retrieves the value for a given key from the browser's sessionStorage.

    :param driver: WebDriver instance
    :param key: Session storage key to look up
    :return: The value (string) associated with that key, or None if not found
    """
    value = driver.execute_script("return sessionStorage.getItem(arguments[0]);", key)
    return value
