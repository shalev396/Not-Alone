from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Set up WebDriver
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)  # Explicit wait up to 10 seconds

try:
    # 1️⃣ Log in and navigate to Profile Page
    driver.get("https://notalonesoldier.com/")
    time.sleep(2)

    # Close Development Notice popup (if present)
    try:
        wait.until(EC.element_to_be_clickable((By.XPATH, "//*[name()='path' and contains(@d,'m6 6 12 12')]"))).click()
        print("✅ Closed development notice popup.")
    except (NoSuchElementException, TimeoutException):
        print("⚠️ No Development Notice popup found.")

    # Click on the Login button
    try:
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Login']"))).click()
    except (NoSuchElementException, TimeoutException):
        print("❌ ERROR: Login button not found!")

    # Enter credentials
    try:
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@id='email']"))).send_keys("nathan@soldier.com")
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@id='password']"))).send_keys("12345678")
    except (NoSuchElementException, TimeoutException):
        print("❌ ERROR: Email or password field not found!")

    # Click the Sign-in button
    try:
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Sign in']"))).click()
        time.sleep(2)
    except (NoSuchElementException, TimeoutException):
        print("❌ ERROR: Sign-in button not found!")

    # Open sidebar menu and click "Profile"
    try:
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'top-3 left-4')]"))).click()
        wait.until(EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Profile']"))).click()
        time.sleep(2)
    except (NoSuchElementException, TimeoutException):
        print("❌ ERROR: Sidebar or Profile button not found!")

    # 2️⃣ Check if the "Your Posts" section is visible
    try:
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[normalize-space()='Your Posts']")))
        print("✅ SUCCESS: 'Your Posts' section is visible.")
    except (NoSuchElementException, TimeoutException):
        print("❌ ERROR: 'Your Posts' section not found!")

except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {str(e)}")

finally:
    time.sleep(3)
    driver.quit()  # Close the browser
