"""Exceptions module initialization."""

from .base import DrandException, DrandClientError, DrandServerError, ConfigurationError
from .crypto import (
    VerificationFailure,
    SignatureVerificationFailure,
    CryptographicError,
    InvalidKeyError,
    HashMismatchError,
)
from .network import (
    NetworkError,
    ConnectionError,
    TimeoutError,
    HTTPError,
    InvalidResponseError,
    APIError,
)

__all__ = [
    # Base exceptions
    "DrandException",
    "DrandClientError",
    "DrandServerError",
    "ConfigurationError",
    # Crypto exceptions
    "VerificationFailure",
    "SignatureVerificationFailure",
    "CryptographicError",
    "InvalidKeyError",
    "HashMismatchError",
    # Network exceptions
    "NetworkError",
    "ConnectionError",
    "TimeoutError",
    "HTTPError",
    "InvalidResponseError",
    "APIError",
]
