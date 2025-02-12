from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time

# Set up WebDriver
driver = webdriver.Chrome()

try:
    # 1️⃣ Log in and navigate to Profile Page
    driver.get("http://localhost:5173/")
    time.sleep(2)

    # Close Development Notice popup (if present)
    try:
        driver.find_element(By.XPATH, "//*[name()='path' and contains(@d,'m6 6 12 12')]").click()
    except NoSuchElementException:
        print("⚠️ No Development Notice popup found.")

    # Click on the Login button
    driver.find_element(By.XPATH, "//button[normalize-space()='Login']").click()
    time.sleep(2)

    # Enter credentials
    driver.find_element(By.XPATH, "//input[@id='email']").send_keys("nathan@soldier.com")
    driver.find_element(By.XPATH, "//input[@id='password']").send_keys("12345678")

    # Click the Sign-in button
    driver.find_element(By.XPATH, "//button[normalize-space()='Sign in']").click()
    time.sleep(2)

    # Open sidebar menu and click "Profile"
    driver.find_element(By.XPATH, "//button[contains(@class, 'top-3 left-4')]").click()
    time.sleep(2)
    driver.find_element(By.XPATH, "//a[normalize-space()='Profile']").click()
    time.sleep(2)

    # 2️⃣ Check if profile information is displayed
    elements_to_check = {
        "Nickname": "//input[@id='nickname']",
        "Phone": "//input[@id='phone']",
        "Bio": "//textarea[@id='bio']",
        "Profile Image": "//img[@alt='Profile']"
    }

    for field, xpath in elements_to_check.items():
        try:
            element = driver.find_element(By.XPATH, xpath)
            assert element.is_displayed(), f"❌ ERROR: {field} is not visible!"
            print(f"✅ SUCCESS: {field} is displayed correctly!")
        except NoSuchElementException:
            print(f"❌ ERROR: {field} not found!")

except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {str(e)}")

finally:
    time.sleep(3)
    driver.quit()  # Close the browser
