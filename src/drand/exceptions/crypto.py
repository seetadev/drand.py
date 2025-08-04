"""Cryptography-related exceptions."""

from .base import DrandException


class VerificationFailure(DrandException):
    """Error raised when the verification for a random value fails.
    The random value is fetched from a node of a drand network.
    """
    pass


class SignatureVerificationFailure(VerificationFailure):
    """Error raised when the verification of the signature fails."""
    pass


class CryptographicError(DrandException):
    """Base class for cryptographic errors."""
    pass


class InvalidKeyError(CryptographicError):
    """Error raised when a cryptographic key is invalid."""
    pass


class HashMismatchError(VerificationFailure):
    """Error raised when hash values don't match."""
    pass
