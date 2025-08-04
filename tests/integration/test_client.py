"""Integration tests for the drand client."""

import pytest
from unittest.mock import AsyncMock
from src.drand.core.domain import DrandService
from src.drand import get_and_verify, get_status


@pytest.mark.asyncio
class TestDrandIntegration:
    """Integration tests for drand client functionality."""

    @pytest.mark.skip(reason="Requires running drand node")
    async def test_end_to_end_verification(self):
        """Test end-to-end randomness verification."""
        # This would require a running drand node
        # address = "localhost:8080"
        # distkey = "test_distkey"
        # result = await get_and_verify(address, distkey=distkey, tls=False)
        # assert "randomness" in result
        pass

    @pytest.mark.skip(reason="Requires running drand node")
    async def test_status_retrieval(self):
        """Test status retrieval from drand node."""
        # This would require a running drand node
        # address = "localhost:8080"
        # status = await get_status(address, tls=False)
        # assert status is not None
        pass

    def test_drand_service_initialization(self):
        """Test DrandService can be initialized."""
        service = DrandService()
        assert service is not None
        assert service.client is not None
