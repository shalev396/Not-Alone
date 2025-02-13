from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, UnexpectedAlertPresentException
import time

# Setup WebDriver
driver = webdriver.Chrome()

try:
    # 1️⃣ Login and navigate to Profile Page
    driver.get("http://localhost:5173/")
    time.sleep(2)

    # Close Development Notice popup
    try:
        driver.find_element(By.XPATH, "//*[name()='path' and contains(@d,'m6 6 12 12')]").click()
    except:
        print("⚠️ No Development Notice popup found.")

    # Click Login button
    driver.find_element(By.XPATH, "//button[normalize-space()='Login']").click()
    time.sleep(2)

    # Enter credentials
    driver.find_element(By.XPATH, "//input[@id='email']").send_keys("nathan@soldier.com")
    driver.find_element(By.XPATH, "//input[@id='password']").send_keys("12345678")

    # Click Sign-in button
    driver.find_element(By.XPATH, "//button[normalize-space()='Sign in']").click()
    time.sleep(2)

    # Open sidebar and navigate to Profile
    driver.find_element(By.XPATH, "//button[contains(@class, 'top-3 left-4')]").click()
    time.sleep(2)
    driver.find_element(By.XPATH, "//a[normalize-space()='Profile']").click()
    time.sleep(2)

    # 2️⃣ Edit Profile: Change nickname, phone, and bio
    new_nickname = "NathanTest123"
    new_phone = "555-1234"
    new_bio = "Hello, this is my new bio!"

    try:
        nickname_field = driver.find_element(By.XPATH, "//input[@id='nickname']")
        nickname_field.clear()
        nickname_field.send_keys(new_nickname)

        phone_field = driver.find_element(By.XPATH, "//input[@id='phone']")
        phone_field.clear()
        phone_field.send_keys(new_phone)

        bio_field = driver.find_element(By.XPATH, "//textarea[@id='bio']")
        bio_field.clear()
        bio_field.send_keys(new_bio)

        print("✅ Profile fields updated successfully.")
    except NoSuchElementException as e:
        print(f"❌ ERROR: Could not find one or more profile fields - {str(e)}")

    # 3️⃣ Click Save Changes button
    try:
        driver.find_element(By.XPATH, "//button[normalize-space()='Save Changes']").click()
        time.sleep(3)  # Wait for changes to save
        print("✅ Changes saved successfully.")
    except NoSuchElementException:
        print("❌ ERROR: Save Changes button not found.")

    # 4️⃣ Handle unexpected alert (if any)
    try:
        alert = driver.switch_to.alert
        alert_text = alert.text
        print(f"⚠️ ALERT FOUND: {alert_text}")
        alert.accept()  # Close the alert
    except UnexpectedAlertPresentException:
        print("❌ ERROR: Unexpected alert blocked the test!")

    # 5️⃣ Verify that the changes were applied
    try:
        updated_nickname = driver.find_element(By.XPATH, "//input[@id='nickname']").get_attribute("value")
        updated_phone = driver.find_element(By.XPATH, "//input[@id='phone']").get_attribute("value")
        updated_bio = driver.find_element(By.XPATH, "//textarea[@id='bio']").get_attribute("value")

        assert updated_nickname == new_nickname, "❌ ERROR: Nickname was not updated!"
        assert updated_phone == new_phone, "❌ ERROR: Phone number was not updated!"
        assert updated_bio == new_bio, "❌ ERROR: Bio was not updated!"

        print("✅ SUCCESS: Profile changes verified!")
    except NoSuchElementException as e:
        print(f"❌ ERROR: Could not verify profile changes - {str(e)}")

except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {str(e)}")

finally:
    time.sleep(3)
    driver.quit()  # Close the browser
