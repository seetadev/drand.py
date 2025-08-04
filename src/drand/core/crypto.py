"""Cryptographic verification functions for drand randomness."""

from hashlib import sha256
from py_ecc import bls
from ..constants.crypto import DRAND_DOMAIN
from ..exceptions.crypto import SignatureVerificationFailure, VerificationFailure


def verify(*, randomness, signature, message_hash, distkey, domain=DRAND_DOMAIN):
    """Verify a drand randomness value and its signature.

    Args:
        randomness (bytes): The randomness value to verify
        signature (bytes): The BLS signature
        message_hash (bytes): The message hash used for signing
        distkey (bytes): The distributed public key
        domain (bytes): The cryptographic domain separator

    Returns:
        bool: True if verification succeeds

    Raises:
        VerificationFailure: If randomness hash verification fails
        SignatureVerificationFailure: If signature verification fails
    """
    if not verify_randomness_hash(randomness, signature):
        raise VerificationFailure(
            f"The hash of the signature {signature.hex()} is not equal to "
            f"the randomness value {randomness.hex()}"
        )
    return verify_signature(
        message_hash=message_hash,
        distkey=distkey,
        signature=signature,
        domain=domain,
    )


def verify_randomness_hash(randomness, signature):
    """Verify that randomness equals the hash of the signature.

    Args:
        randomness (bytes): The claimed randomness value
        signature (bytes): The BLS signature

    Returns:
        bool: True if randomness equals sha256(signature)
    """
    return sha256(signature).digest() == randomness


def verify_signature(*, distkey, message_hash, signature, domain=DRAND_DOMAIN):
    """Verify a BLS signature against a message hash and distributed key.

    Args:
        distkey (bytes): The distributed public key
        message_hash (bytes): The hash of the message that was signed
        signature (bytes): The BLS signature to verify
        domain (bytes): The cryptographic domain separator

    Returns:
        bool: True if signature is valid
    """
    return bls.verify(message_hash, distkey, signature, domain)
