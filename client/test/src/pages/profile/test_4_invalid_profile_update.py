import pytest
import allure
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, UnexpectedAlertPresentException
import time

# Start WebDriver
driver = webdriver.Chrome()

# 1️⃣ Access the website and log in
driver.get("https://notalonesoldier.com/")
time.sleep(2)

# Close Development Notice popup (if present)
try:
    driver.find_element(By.XPATH, "//*[name()='path' and contains(@d,'m6 6 12 12')]").click()
except:
    print("⚠️ No Development Notice popup found.")

# Click on the Login button
driver.find_element(By.XPATH, "//button[normalize-space()='Login']").click()
time.sleep(2)

# Enter invalid credentials
driver.find_element(By.XPATH, "//input[@id='email']").send_keys("nathan@soldier.com")
driver.find_element(By.XPATH, "//input[@id='password']").send_keys("12345678")
driver.find_element(By.XPATH, "//button[normalize-space()='Sign in']").click()
time.sleep(2)

# Open sidebar menu and click "Profile"
driver.find_element(By.XPATH, "//button[contains(@class, 'top-3 left-4')]").click()
time.sleep(2)
driver.find_element(By.XPATH, "//a[normalize-space()='Profile']").click()
time.sleep(2)

# 2️⃣ Edit Profile with INVALID data
invalid_nickname = "!!!Invalid@@@"
invalid_phone = "abc123xyz"
long_bio = "x" * 300  # Create a very long bio (assuming the limit is lower)

try:
    nickname_field = driver.find_element(By.XPATH, "//input[@id='nickname']")
    nickname_field.clear()
    nickname_field.send_keys(invalid_nickname)

    phone_field = driver.find_element(By.XPATH, "//input[@id='phone']")
    phone_field.clear()
    phone_field.send_keys(invalid_phone)

    bio_field = driver.find_element(By.XPATH, "//textarea[@id='bio']")
    bio_field.clear()
    bio_field.send_keys(long_bio)

    print("✅ Invalid profile fields entered.")
except NoSuchElementException as e:
    print(f"❌ ERROR: Could not find one or more profile fields - {str(e)}")

# 3️⃣ Scroll and Click Save Changes button
try:
    save_button = driver.find_element(By.XPATH, "//button[normalize-space()='Save Changes']")
    driver.execute_script("arguments[0].scrollIntoView();", save_button)  # Scroll to button
    time.sleep(1)  # Small delay
    save_button.click()
    time.sleep(2)  # Wait for validation messages
    print("✅ Clicked Save Changes button.")
except NoSuchElementException:
    print("❌ ERROR: Save Changes button not found.")

# 4️⃣ Handle Unexpected Alert
try:
    alert = driver.switch_to.alert
    print(f"⚠️ ALERT PRESENT: {alert.text}")
    alert.accept()  # Close the alert
    time.sleep(1)
except:
    print("✅ No unexpected alert.")

# 5️⃣ Check if validation errors appear
try:
    error_messages = driver.find_elements(By.XPATH, "//p[contains(@class, 'text-red')]")  # Adjust XPath if needed
    assert len(error_messages) > 0, "❌ ERROR: No validation messages appeared!"
    print("✅ SUCCESS: Validation messages appeared for invalid inputs!")
except NoSuchElementException as e:
    print(f"❌ ERROR: No validation messages found - {str(e)}")

# Close browser
time.sleep(3)
driver.quit()
