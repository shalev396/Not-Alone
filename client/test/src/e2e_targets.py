"""Single source for E2E URLs — local Vite + local API only.

Change these constants if your dev ports differ. Tests do not read production
or deploy env for origins; the app under test is always the local stack.
"""

# Frontend (Selenium `driver.get`, path assertions)
_LOCAL_SITE_BASE = "http://localhost:5173"

# HTTP API root (requests, same shape as client getApiUrl())
_LOCAL_API_ROOT = "http://localhost:3000/api"

# Socket.IO: origin only; pair with SOCKET_IO_PATH (same as client getSocketUrl + path)
_LOCAL_SOCKET_ORIGIN = "http://localhost:3000"

SOCKET_IO_PATH = "/api/socket.io"


def get_site_base() -> str:
    return _LOCAL_SITE_BASE.rstrip("/")


def get_api_root() -> str:
    return _LOCAL_API_ROOT.rstrip("/")


def get_socket_origin() -> str:
    return _LOCAL_SOCKET_ORIGIN.rstrip("/")
