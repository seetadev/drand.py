"""Unit tests for cryptographic functions."""

import pytest
from src.drand.core.crypto import verify_randomness_hash, verify_signature
from src.drand.constants.crypto import DRAND_DOMAIN
from src.drand.exceptions.crypto import VerificationFailure


class TestCryptographicFunctions:
    """Test suite for cryptographic verification functions."""

    def test_verify_randomness_hash_success(self):
        """Test successful randomness hash verification."""
        from hashlib import sha256

        signature = b"test_signature_data"
        expected_randomness = sha256(signature).digest()

        assert verify_randomness_hash(expected_randomness, signature) is True

    def test_verify_randomness_hash_failure(self):
        """Test failed randomness hash verification."""
        signature = b"test_signature_data"
        wrong_randomness = b"wrong_randomness_value"

        assert verify_randomness_hash(wrong_randomness, signature) is False

    @pytest.mark.skip(reason="Requires py_ecc dependency")
    def test_verify_signature_valid(self):
        """Test BLS signature verification with valid signature."""
        # This would require setting up valid BLS keys and signatures
        # Skipped due to dependency requirements
        pass

    @pytest.mark.skip(reason="Requires py_ecc dependency")
    def test_verify_signature_invalid(self):
        """Test BLS signature verification with invalid signature."""
        # This would require setting up invalid BLS signatures
        # Skipped due to dependency requirements
        pass
