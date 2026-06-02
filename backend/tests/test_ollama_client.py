import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.integrations.ollama_client import OllamaClient
from app.core.errors import AIUnavailableError, AITimeoutError, AIInvalidResponseError


@pytest.fixture
def client():
    return OllamaClient()


class TestOllamaClient:
    @pytest.mark.asyncio
    async def test_successful_response(self, client):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "model": "qwen2.5vl:7b",
            "response": '{"main_category": {"value": "Women Clothing", "confidence_percentage": "90%"}}',
            "done": True,
        }
        mock_response.raise_for_status = MagicMock()

        mock_post = AsyncMock(return_value=mock_response)
        with patch("httpx.AsyncClient.post", mock_post):
            result = await client.generate("test prompt", format_json=True)
            assert "response_text" in result
            assert result["latency_ms"] >= 0

    @pytest.mark.asyncio
    async def test_timeout_raises_error(self, client):
        import httpx

        mock_post = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
        with patch("httpx.AsyncClient.post", mock_post):
            with pytest.raises(AITimeoutError):
                await client.generate("test prompt")

    @pytest.mark.asyncio
    async def test_connection_error_raises_unavailable(self, client):
        import httpx

        mock_post = AsyncMock(side_effect=httpx.ConnectError("refused"))
        with patch("httpx.AsyncClient.post", mock_post):
            with pytest.raises(AIUnavailableError):
                await client.generate("test prompt")

    @pytest.mark.asyncio
    async def test_empty_response_raises_error(self, client):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"response": "", "done": True}
        mock_response.raise_for_status = MagicMock()

        mock_post = AsyncMock(return_value=mock_response)
        with patch("httpx.AsyncClient.post", mock_post):
            with pytest.raises(AIInvalidResponseError):
                await client.generate("test prompt")
