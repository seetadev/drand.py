"""Network-related exceptions."""

from .base import DrandClientError, DrandServerError


class NetworkError(DrandClientError):
    """Base class for network-related errors."""
    pass


class ConnectionError(NetworkError):
    """Error connecting to drand node."""
    pass


class TimeoutError(NetworkError):
    """Request timeout error."""
    pass


class HTTPError(NetworkError):
    """HTTP protocol error."""

    def __init__(self, message, status_code=None, response=None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response


class InvalidResponseError(DrandServerError):
    """Error when server returns invalid response."""
    pass


class APIError(DrandServerError):
    """Error from drand API."""

    def __init__(self, message, error_code=None):
        super().__init__(message)
        self.error_code = error_code
