import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager


# this is the setup for all tests
@pytest.fixture(scope="session")
def driver():
    options = Options()

    # Uncomment if you want headless mode
    # options.add_argument("--headless")
    # options.add_argument("--disable-gpu")
    # options.add_argument("--window-size=1920,1080")

    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)

    yield driver  # Provide the WebDriver instance to tests

    driver.quit()  # Close the browser after tests finish
