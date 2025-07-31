"""API endpoint definitions and URL construction utilities."""


def construct_url(*, address, endpoint, tls):
    """Construct a full URL for drand API requests.

    Args:
        address (str): The drand node address (host:port)
        endpoint (str): The API endpoint path
        tls (bool): Whether to use HTTPS or HTTP

    Returns:
        str: Complete URL for the API request
    """
    scheme = "https" if tls else "http"
    return f"{scheme}://{address}/{endpoint}"


def build_public_rand_endpoint(round_=""):
    """Build the public randomness endpoint with optional round.

    Args:
        round_ (str|int): Specific round number (empty for latest)

    Returns:
        str: The endpoint path for public randomness
    """
    from ..constants.network import ENDPOINTS

    if round_:
        return f"{ENDPOINTS.PUBLIC_RAND.value}/{round_}"
    return ENDPOINTS.PUBLIC_RAND.value
