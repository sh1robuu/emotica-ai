import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
import builtins

client = TestClient(app)

@patch("api.routers.vision.get_emotion_analyzer")
def test_detect_facial_emotion_success(mock_get_analyzer):
    # Mocking successful pipeline response
    mock_pipeline = MagicMock()
    mock_pipeline.return_value = [{"label": "happy", "score": 0.99}]
    mock_get_analyzer.return_value = mock_pipeline
    
    from PIL import Image
    import io
    
    # Create a valid 1x1 image memory buffer using PIL
    img = Image.new('RGB', (1, 1), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    response = client.post(
        "/api/vision/emotion",
        files={"file": ("test_face.jpg", img_byte_arr, "image/jpeg")}
    )
    
    assert response.status_code == 200, response.json()
    assert response.json()["emotion"] == "Happy"
    mock_pipeline.assert_called_once()

def test_detect_facial_emotion_invalid_file():
    file_content = b"fake pdf data"
    response = client.post(
        "/api/vision/emotion",
        files={"file": ("test_file.pdf", file_content, "application/pdf")}
    )
    
    assert response.status_code == 400
    assert "Only .jpg, .jpeg, or .png files are supported" in response.json()["detail"]
