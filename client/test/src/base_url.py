"""Paths for Selenium + requests, derived from local E2E targets only."""

from src.e2e_targets import get_api_root, get_site_base

SITE_BASE = get_site_base()
API_ROOT = get_api_root()


def site(path: str = "/") -> str:
    if not path.startswith("/"):
        path = "/" + path
    return f"{SITE_BASE}{path}"


def api_url(path: str) -> str:
    if not path.startswith("/"):
        path = "/" + path
    return f"{API_ROOT}{path}"


def urls_match(actual: str, expected_path: str) -> bool:
    if not expected_path.startswith("/"):
        expected_path = "/" + expected_path
    exp = site(expected_path)
    a = actual.rstrip("/").split("?")[0]
    b = exp.rstrip("/").split("?")[0]
    return a == b
