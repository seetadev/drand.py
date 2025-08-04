"""General helper functions and utilities."""

from hashlib import sha256
from .conversion import int_to_bytes, hex_to_bytes


def construct_message_hash(round_, previous_signature):
    """Construct the message hash for signature verification.

    Args:
        round_ (int): The round number
        previous_signature (str|bytes): Previous signature (hex string or bytes)

    Returns:
        bytes: SHA256 hash of round + previous_signature
    """
    round_bytes = int_to_bytes(round_)

    if isinstance(previous_signature, str):
        previous_sig_bytes = hex_to_bytes(previous_signature)
    else:
        previous_sig_bytes = previous_signature

    return sha256(round_bytes + previous_sig_bytes).digest()


def validate_hex_string(hex_str):
    """Validate that a string is a valid hex string.

    Args:
        hex_str (str): The string to validate

    Returns:
        bool: True if valid hex string
    """
    try:
        int(hex_str, 16)
        return True
    except ValueError:
        return False


def safe_int_conversion(value, default=0):
    """Safely convert a value to integer with fallback.

    Args:
        value: Value to convert
        default (int): Default value if conversion fails

    Returns:
        int: Converted integer or default
    """
    try:
        return int(value)
    except (ValueError, TypeError):
        return default
