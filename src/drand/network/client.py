"""HTTP client for drand network communication."""

from aiohttp import ClientSession
from .endpoints import construct_url
from ..constants.network import ENDPOINTS


class DrandClient:
    """HTTP client for drand API communication."""

    async def _get_json_with_session(self, url, session):
        """Get JSON response using provided or new session.

        Args:
            url (str): The URL to request
            session (aiohttp.ClientSession, optional): HTTP session

        Returns:
            dict: JSON response data
        """
        if session:
            async with session.get(url) as resp:
                return await resp.json()

        async with ClientSession() as new_session:
            async with new_session.get(url) as resp:
                return await resp.json()

    async def get_status(self, address, *, session=None, tls=True):
        """Get the status of a drand node.

        Args:
            address (str): Drand node address
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            str: Node status
        """
        url = construct_url(address=address, endpoint=ENDPOINTS.HOME.value, tls=tls)
        json_resp = await self._get_json_with_session(url, session)
        return json_resp["status"]

    async def get_group_info(self, address, *, session=None, tls=True):
        """Get group information from a drand node.

        Args:
            address (str): Drand node address
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            dict: Group information
        """
        url = construct_url(address=address, endpoint=ENDPOINTS.GROUP.value, tls=tls)
        return await self._get_json_with_session(url, session)

    async def get_distkey(self, address, *, session=None, tls=True):
        """Get the distributed public key from a drand node.

        Args:
            address (str): Drand node address
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            str: Hex-encoded distributed public key
        """
        url = construct_url(address=address, endpoint=ENDPOINTS.DISTKEY.value, tls=tls)
        json_resp = await self._get_json_with_session(url, session)
        return json_resp["key"]

    async def get_public_rand(self, address, *, round_="", session=None, tls=True):
        """Get public randomness from a drand node.

        Args:
            address (str): Drand node address
            round_ (str|int): Specific round number (empty for latest)
            session (aiohttp.ClientSession, optional): HTTP session
            tls (bool): Whether to use HTTPS

        Returns:
            dict: Randomness data including signature, round, etc.
        """
        endpoint = (
            f"{ENDPOINTS.PUBLIC_RAND.value}/{round_}"
            if round_
            else ENDPOINTS.PUBLIC_RAND.value
        )
        url = construct_url(address=address, endpoint=endpoint, tls=tls)
        return await self._get_json_with_session(url, session)
