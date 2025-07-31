"""Cryptographic constants and configuration."""

# BLS domain separator for drand signatures
DRAND_DOMAIN = bytes([1, 9, 6, 9, 9, 6, 9, 2])

# Signature and key size constants
BLS_SIGNATURE_SIZE = 96  # bytes
BLS_PUBLIC_KEY_SIZE = 48  # bytes
BLS_PRIVATE_KEY_SIZE = 32  # bytes

# Hash algorithm constants
HASH_ALGORITHM = "sha256"
HASH_SIZE = 32  # bytes for SHA-256
