"""Test fixtures and mock data for drand tests."""

import json


# Mock drand responses
MOCK_DISTKEY = "87c471f7dfb120b04ab749f61a20635f90096dd804c00d06ffe5c0a0a5ba6e43759652a1faa5122880f23b5f6a005bac"

MOCK_DISTKEY_RESPONSE = {
    "key": MOCK_DISTKEY
}

MOCK_PUBLIC_RAND_RESPONSE = {
    "round": 3,
    "previous": "a5d55fbbd2029117188a37c56d368126d2eafe558bba7de536970a650a8f2aa958b84c03cac5af3959886608415f809910df98493756b5855bdcb23de6e6d75117822f689f3d79182a11a408267bd8030354c904be591e649a761c5402c4177f",
    "signature": "89463f52052c02349fe97692ca4de67e5c87160f8731cfd80d2a7587b40d5e7cca1d5e34d0cb7207c287d21023e80a1e01dae8840737623dd389e36faac5641f1fa642909a06e85c6da8de1f620c898e094a38cdd4b1aab5e8d4fe6177a0cfe5",
    "randomness": "bd6d1deec5a7f54ad0aa51d1c871767a337c1e7f23d4b178133523a0a4098247",
}

MOCK_STATUS_RESPONSE = {
    "status": "ready"
}

MOCK_GROUP_RESPONSE = {
    "Nodes": [
        {"Address": "localhost:8080"},
        {"Address": "localhost:8081"},
        {"Address": "localhost:8082"},
    ],
    "Threshold": 2,
    "Period": "30s",
}


# Test data for cryptographic operations
VALID_HEX_STRINGS = [
    "deadbeef",
    "123456789abcdef",
    "ABCDEF123456",
    "0123456789abcdef",
]

INVALID_HEX_STRINGS = [
    "xyz123",
    "hello world",
    "123xyz",
    "",
    "0x",  # prefix only
]


# Mock HTTP responses
def mock_json_response(data):
    """Create a mock HTTP response with JSON data."""
    class MockResponse:
        def __init__(self, json_data):
            self.json_data = json_data

        async def json(self):
            return self.json_data

        def raise_for_status(self):
            pass

    return MockResponse(data)


# Utility functions for test setup
def get_mock_distkey():
    """Get mock distributed key for testing."""
    return MOCK_DISTKEY


def get_mock_randomness_data():
    """Get mock randomness response for testing."""
    return MOCK_PUBLIC_RAND_RESPONSE.copy()
