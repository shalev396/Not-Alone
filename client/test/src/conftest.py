import pytest
import allure
import os
from pathlib import Path

from dotenv import load_dotenv

_env_ci = Path(__file__).resolve().parent.parent / ".env.ci"
if _env_ci.is_file():
    load_dotenv(_env_ci, override=False)

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime

# Create screenshots directory if it doesn't exist
if not os.path.exists("screenshots"):
    os.makedirs("screenshots")


def pytest_addoption(parser):
    parser.addoption(
        "--headed",
        action="store_true",
        default=False,
        help="Run Chrome with a visible window (default is headless).",
    )


# this is the setup for all tests
@pytest.fixture(scope="session")
def driver(request):
    options = Options()

    headed = request.config.getoption("--headed")
    if not headed:
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1920,1080")
    # GitHub Actions / Linux runners need these regardless of headless vs headed
    if os.environ.get("CI") == "true":
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    driver.maximize_window()  # Maximize window for consistent screenshots

    yield driver  # Provide the WebDriver instance to tests

    driver.quit()  # Close the browser after tests finish


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call":
        # If a test has failed
        if report.failed:
            try:
                # Get the driver fixture
                driver = item.funcargs['driver']
                
                # Create a unique filename for the screenshot
                timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
                test_name = item.name.replace(" ", "_").replace("/", "_")
                screenshot_path = os.path.abspath(f"screenshots/failed_{test_name}_{timestamp}.png")
                
                # Take screenshot
                driver.save_screenshot(screenshot_path)
                
                # Attach screenshot to Allure report
                allure.attach.file(
                    screenshot_path,
                    name=f"Screenshot of failure in {item.name}",
                    attachment_type=allure.attachment_type.PNG
                )
                
                # Also attach page source for debugging
                allure.attach(
                    driver.page_source,
                    name=f"Page source at failure in {item.name}",
                    attachment_type=allure.attachment_type.HTML
                )
                
                # Add to the HTML report if using pytest-html
                if hasattr(item.config, '_html'):
                    # Create relative path for HTML report
                    rel_path = os.path.relpath(screenshot_path, os.path.dirname(item.config.option.htmlpath))
                    report.extra = [
                        {'name': 'Screenshot', 'format': 'image', 'content': rel_path}
                    ]
                    
            except Exception as e:
                print(f"Failed to capture screenshot: {str(e)}")
                allure.attach(
                    str(e),
                    name="Screenshot capture failed",
                    attachment_type=allure.attachment_type.TEXT
                )
