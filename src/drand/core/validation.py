"""Data validation and verification logic for drand responses."""

from hashlib import sha256
from .crypto import verify
from ..utils.conversion import int_to_bytes
from ..exceptions.crypto import SignatureVerificationFailure


def validate_and_verify_randomness(*, json_data, distkey, round_=None):
    """Validate and verify a randomness response from drand.

    Args:
        json_data (dict): JSON response from drand API
        distkey (str): Hex-encoded distributed public key
        round_ (int, optional): Expected round number

    Returns:
        dict: The validated JSON data

    Raises:
        SignatureVerificationFailure: If verification fails
    """
    if not round_:
        round_ = json_data["round"]

    round_bytes = int_to_bytes(round_)
    previous_signature = bytes.fromhex(json_data["previous"])
    signature = bytes.fromhex(json_data["signature"])
    randomness = bytes.fromhex(json_data["randomness"])
    message_hash = sha256(round_bytes + previous_signature).digest()
    distkey_bytes = bytes.fromhex(distkey)

    if not verify(
        randomness=randomness,
        message_hash=message_hash,
        signature=signature,
        distkey=distkey_bytes,
    ):
        raise SignatureVerificationFailure(json_data)

    return json_data


def construct_message_hash(round_, previous_signature_hex):
    """Construct the message hash for signature verification.

    Args:
        round_ (int): The round number
        previous_signature_hex (str): Hex-encoded previous signature

    Returns:
        bytes: SHA256 hash of round + previous_signature
    """
    round_bytes = int_to_bytes(round_)
    previous_signature = bytes.fromhex(previous_signature_hex)
    return sha256(round_bytes + previous_signature).digest()
