"""Core domain logic for drand client operations."""

from .validation import validate_and_verify_randomness
from ..network.client import DrandClient


class DrandService:
    """High-level service for drand operations."""

    def __init__(self, client=None):
        """Initialize the drand service.

        Args:
            client (DrandClient, optional): HTTP client instance
        """
        self.client = client or DrandClient()

    async def get_and_verify(self, address, *, distkey, round_="", session=None, tls=True):
        """Get and verify a randomness value from drand.

        Args:
            address (str): Drand node address
            distkey (str): Hex-encoded distributed public key
            round_ (str|int): Specific round number (empty for latest)
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            dict: Verified randomness data
        """
        json_data = await self.client.get_public_rand(
            address, round_=round_, session=session, tls=tls
        )
        return validate_and_verify_randomness(
            json_data=json_data, distkey=distkey, round_=round_
        )

    async def get_status(self, address, *, session=None, tls=True):
        """Get the status of a drand node.

        Args:
            address (str): Drand node address
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            str: Node status
        """
        return await self.client.get_status(address, session=session, tls=tls)

    async def get_group_info(self, address, *, session=None, tls=True):
        """Get group information from a drand node.

        Args:
            address (str): Drand node address
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            dict: Group information
        """
        return await self.client.get_group_info(address, session=session, tls=tls)

    async def get_distkey(self, address, *, session=None, tls=True):
        """Get the distributed public key from a drand node.

        Args:
            address (str): Drand node address
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            str: Hex-encoded distributed public key
        """
        return await self.client.get_distkey(address, session=session, tls=tls)
