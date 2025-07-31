"""Unit tests for utility functions."""

import pytest
from src.drand.utils.conversion import int_to_bytes, hex_to_bytes, bytes_to_hex
from src.drand.utils.helpers import validate_hex_string, safe_int_conversion


class TestConversionUtils:
    """Test suite for data conversion utilities."""

    def test_int_to_bytes(self):
        """Test integer to bytes conversion."""
        # Test with a known value
        result = int_to_bytes(1234)
        assert isinstance(result, bytes)
        assert len(result) == 8  # INT_BYTE_LENGTH

    def test_hex_to_bytes(self):
        """Test hex string to bytes conversion."""
        hex_str = "deadbeef"
        result = hex_to_bytes(hex_str)
        assert result == bytes.fromhex(hex_str)

    def test_hex_to_bytes_with_prefix(self):
        """Test hex string with 0x prefix."""
        hex_str = "0xdeadbeef"
        result = hex_to_bytes(hex_str)
        assert result == bytes.fromhex("deadbeef")

    def test_bytes_to_hex(self):
        """Test bytes to hex string conversion."""
        test_bytes = b"\xde\xad\xbe\xef"
        result = bytes_to_hex(test_bytes)
        assert result == "deadbeef"

    def test_bytes_to_hex_with_prefix(self):
        """Test bytes to hex with prefix."""
        test_bytes = b"\xde\xad\xbe\xef"
        result = bytes_to_hex(test_bytes, prefix=True)
        assert result == "0xdeadbeef"


class TestHelperUtils:
    """Test suite for helper utilities."""

    def test_validate_hex_string_valid(self):
        """Test hex string validation with valid input."""
        assert validate_hex_string("deadbeef") is True
        assert validate_hex_string("123456") is True
        assert validate_hex_string("abcdef") is True

    def test_validate_hex_string_invalid(self):
        """Test hex string validation with invalid input."""
        assert validate_hex_string("xyz") is False
        assert validate_hex_string("hello") is False
        assert validate_hex_string("") is False

    def test_safe_int_conversion_success(self):
        """Test successful integer conversion."""
        assert safe_int_conversion("123") == 123
        assert safe_int_conversion(456) == 456
        assert safe_int_conversion("0") == 0

    def test_safe_int_conversion_failure(self):
        """Test integer conversion with fallback."""
        assert safe_int_conversion("abc") == 0
        assert safe_int_conversion("abc", default=42) == 42
        assert safe_int_conversion(None) == 0
