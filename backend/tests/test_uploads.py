import pytest
from io import BytesIO
from PIL import Image


def create_test_image(format="JPEG", size=(100, 100)) -> bytes:
    img = Image.new("RGB", size, color="red")
    buf = BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()


class TestImageUpload:
    @pytest.mark.asyncio
    async def test_upload_jpeg(self, client):
        content = create_test_image("JPEG")
        response = await client.post(
            "/api/v1/uploads/images",
            files={"file": ("test.jpg", content, "image/jpeg")},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["content_type"] == "image/jpeg"
        assert data["width"] == 100
        assert data["height"] == 100
        assert "id" in data
        assert data["url"].startswith("/media/products/")

    @pytest.mark.asyncio
    async def test_upload_png(self, client):
        content = create_test_image("PNG")
        response = await client.post(
            "/api/v1/uploads/images",
            files={"file": ("test.png", content, "image/png")},
        )
        assert response.status_code == 201
        assert response.json()["content_type"] == "image/png"

    @pytest.mark.asyncio
    async def test_upload_invalid_type(self, client):
        content = b"this is not an image file at all"
        response = await client.post(
            "/api/v1/uploads/images",
            files={"file": ("test.pdf", content, "application/pdf")},
        )
        assert response.status_code == 415
        assert response.json()["error"]["code"] == "UPLOAD_INVALID_TYPE"

    @pytest.mark.asyncio
    async def test_upload_no_file(self, client):
        response = await client.post("/api/v1/uploads/images")
        assert response.status_code == 422
