from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, UnexpectedAlertPresentException
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
        print("✅ Closed development notice popup.")
    except NoSuchElementException:
        print("⚠️ No Development Notice popup found.")

    # Click on the Login button
    try:
        driver.find_element(By.XPATH, "//button[normalize-space()='Login']").click()
        time.sleep(2)
    except NoSuchElementException:
        print("❌ ERROR: Login button not found!")

    # Enter credentials
    try:
        driver.find_element(By.XPATH, "//input[@id='email']").send_keys("nathan@soldier.com")
        driver.find_element(By.XPATH, "//input[@id='password']").send_keys("12345678")
    except NoSuchElementException:
        print("❌ ERROR: Email or password field not found!")

    # Click the Sign-in button
    try:
        driver.find_element(By.XPATH, "//button[normalize-space()='Sign in']").click()
        time.sleep(2)
    except NoSuchElementException:
        print("❌ ERROR: Sign-in button not found!")

    # Open sidebar menu and click "Profile"
    try:
        driver.find_element(By.XPATH, "//button[contains(@class, 'top-3 left-4')]").click()
        time.sleep(2)
        driver.find_element(By.XPATH, "//a[normalize-space()='Profile']").click()
        time.sleep(2)
    except NoSuchElementException:
        print("❌ ERROR: Sidebar or Profile button not found!")

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
    except NoSuchElementException:
        print("❌ ERROR: Could not find one or more profile fields.")

    # 3️⃣ Click Save Changes button (handling element interception)
    try:
        save_button = driver.find_element(By.XPATH, "//button[normalize-space()='Save Changes']")
        driver.execute_script("arguments[0].click();", save_button)  # Força o clique via JavaScript
        time.sleep(3)
        print("✅ Clicked Save Changes button.")
    except NoSuchElementException:
        print("❌ ERROR: Save Changes button not found!")

    # 4️⃣ Handle unexpected alerts
    try:
        alert = driver.switch_to.alert
        alert_text = alert.text
        print(f"⚠️ ALERT FOUND: {alert_text}")
        alert.accept()
    except:
        print("✅ No unexpected alerts found.")

    # 5️⃣ Check if profile information is displayed correctly
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
