"""Network and API constants."""

from enum import Enum


class ENDPOINTS(Enum):
    """Drand API endpoints."""
    HOME = "api"
    PUBLIC_RAND = "api/public"
    DISTKEY = "api/info/distkey"
    GROUP = "api/info/group"


# Default network configuration
DEFAULT_TIMEOUT = 30  # seconds
DEFAULT_MAX_RETRIES = 3
DEFAULT_TLS = True

# HTTP status codes
HTTP_OK = 200
HTTP_NOT_FOUND = 404
HTTP_SERVER_ERROR = 500
