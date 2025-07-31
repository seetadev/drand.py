"""Data type conversion utilities."""

from ..constants.config import INT_BYTEORDER, INT_BYTE_LENGTH


def int_to_bytes(int_value):
    """Convert an integer to bytes using configured byte order and length.

    Args:
        int_value (int): The integer to convert

    Returns:
        bytes: The integer as bytes
    """
    return int.to_bytes(int_value, INT_BYTE_LENGTH, byteorder=INT_BYTEORDER)


def hex_to_bytes(hex_value):
    """Convert a hex string to bytes.

    Args:
        hex_value (str): Hex string (with or without '0x' prefix)

    Returns:
        bytes: The hex string as bytes
    """
    # Remove '0x' prefix if present
    if hex_value.startswith('0x'):
        hex_value = hex_value[2:]
    return bytes.fromhex(hex_value)


def bytes_to_hex(byte_value, prefix=False):
    """Convert bytes to hex string.

    Args:
        byte_value (bytes): The bytes to convert
        prefix (bool): Whether to add '0x' prefix

    Returns:
        str: Hex string representation
    """
    hex_str = byte_value.hex()
    return f"0x{hex_str}" if prefix else hex_str
