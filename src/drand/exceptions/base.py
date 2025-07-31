"""Base exception classes for drand client."""


class DrandException(Exception):
    """Base class for all drand-related exceptions."""
    pass


class DrandClientError(DrandException):
    """Base class for client-side errors."""
    pass


class DrandServerError(DrandException):
    """Base class for server-side errors."""
    pass


class ConfigurationError(DrandClientError):
    """Error in client configuration or setup."""
    pass
