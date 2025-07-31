"""Modern drand.py client - Refactored for better organization."""

# Import main API functions for backward compatibility
from .core import verify, verify_randomness_hash, verify_signature
from .core.domain import DrandService
from .network import DrandClient
from .exceptions import (
    DrandException,
    VerificationFailure,
    SignatureVerificationFailure,
    NetworkError,
)

# Version information
__version__ = "0.1.0.dev3"

# Maintain backward compatibility with original API


async def get_and_verify(address, *, distkey, round_="", session=None, tls=True):
    """Get and verify a randomness value from drand (backward compatibility).

    Args:
        address (str): Drand node address
        distkey (str): Hex-encoded distributed public key
        round_ (str|int): Specific round number (empty for latest)
        session (aiohttp.ClientSession, optional): HTTP session
        tls (bool): Whether to use HTTPS

    Returns:
        dict: Verified randomness data
    """
    service = DrandService()
    return await service.get_and_verify(
        address, distkey=distkey, round_=round_, session=session, tls=tls
    )


async def get_status(address, *, session=None, tls=True):
    """Get the status of a drand node (backward compatibility)."""
    client = DrandClient()
    return await client.get_status(address, session=session, tls=tls)


async def get_group_info(address, *, session=None, tls=True):
    """Get group information from a drand node (backward compatibility)."""
    client = DrandClient()
    return await client.get_group_info(address, session=session, tls=tls)


async def get_distkey(address, *, session=None, tls=True):
    """Get the distributed public key from a drand node (backward compatibility)."""
    client = DrandClient()
    return await client.get_distkey(address, session=session, tls=tls)


# Public API exports
__all__ = [
    # Backward compatibility functions
    "get_and_verify",
    "get_distkey",
    "get_group_info",
    "get_status",
    "verify",
    "verify_randomness_hash",
    # New organized classes
    "DrandService",
    "DrandClient",
    # Exceptions
    "DrandException",
    "VerificationFailure",
    "SignatureVerificationFailure",
    "NetworkError",
    # Version
    "__version__",
]
