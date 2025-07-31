"""Request and response handling utilities."""

from typing import Dict, Any, Optional
from aiohttp import ClientSession


async def make_json_request(url: str, session: Optional[ClientSession] = None) -> Dict[str, Any]:
    """Make a JSON HTTP request.

    Args:
        url (str): The URL to request
        session (ClientSession, optional): Existing session to use

    Returns:
        dict: The JSON response

    Raises:
        aiohttp.ClientError: If request fails
    """
    if session:
        async with session.get(url) as resp:
            resp.raise_for_status()
            return await resp.json()

    async with ClientSession() as new_session:
        async with new_session.get(url) as resp:
            resp.raise_for_status()
            return await resp.json()


def extract_field(json_data: Dict[str, Any], field: str, default=None):
    """Extract a field from JSON response with optional default.

    Args:
        json_data (dict): The JSON response data
        field (str): The field name to extract
        default: Default value if field is missing

    Returns:
        Any: The field value or default
    """
    return json_data.get(field, default)
