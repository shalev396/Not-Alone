from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time

# Set up WebDriver
driver = webdriver.Chrome()

try:
    # 1️⃣ Access the website and log in
    driver.get("https://notalonesoldier.com/")

    # Close Development Notice popup (if present)
    try:
        esc = driver.find_element(By.XPATH, "//*[name()='path' and contains(@d,'m6 6 12 12')]")
        esc.click()
    except:
        print("⚠️ Development notice popup not found.")

    # Click on the Login button
    driver.find_element(By.XPATH, "//button[normalize-space()='Login']").click()

    # Enter credentials
    driver.find_element(By.XPATH, "//input[@id='email']").send_keys("nathan@soldier.com")
    driver.find_element(By.XPATH, "//input[@id='password']").send_keys("12345678")

    # Click the Sign-in button
    driver.find_element(By.XPATH, "//button[normalize-space()='Sign in']").click()

    # Open sidebar menu and click "Profile"
    driver.find_element(By.XPATH, "//button[contains(@class, 'top-3 left-4')]").click()
    driver.find_element(By.XPATH, "//a[normalize-space()='Profile']").click()

    # 2️⃣ Check if the Profile page loaded correctly
    try:
        title_element = driver.find_element(By.XPATH, "//h1[normalize-space()='Profile Settings']")
        assert title_element is not None, "❌ ERROR: 'Profile Settings' title not found!"
        print("✅ SUCCESS: Profile page loaded correctly!")
    except NoSuchElementException:
        print("❌ ERROR: 'Profile Settings' title not found!")

except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {str(e)}")

finally:
    driver.quit()  # Close the browser
