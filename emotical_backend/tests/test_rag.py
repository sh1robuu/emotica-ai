import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
from langchain_core.documents import Document

client = TestClient(app)

@patch("api.routers.rag.get_vector_store")
@patch("api.routers.rag.get_embeddings")
@patch("api.routers.rag.save_vector_store")
@patch("api.routers.rag.TextLoader")
def test_upload_txt_document(mock_text_loader, mock_save, mock_get_embeddings, mock_get_store):
    # Mock Document Loader
    mock_loader_instance = MagicMock()
    mock_loader_instance.load.return_value = [Document(page_content="Mock Document Text", metadata={"source": "test.txt"})]
    mock_text_loader.return_value = mock_loader_instance
    
    # Mock embedding and vector store
    mock_get_embeddings.return_value = MagicMock()
    mock_store_instance = MagicMock()
    mock_get_store.return_value = mock_store_instance
    
    file_content = b"This is a test document."
    response = client.post(
        "/api/rag/documents",
        files={"file": ("test.txt", file_content, "text/plain")}
    )
    
    assert response.status_code == 200, response.json()
    assert "Successfully processed" in response.json()["message"]
    mock_text_loader.assert_called_once()
    mock_save.assert_called_once()

def test_upload_invalid_document_type():
    file_content = b"This is a test document."
    response = client.post(
        "/api/rag/documents",
        files={"file": ("test.png", file_content, "image/png")}
    )
    
    assert response.status_code == 400
    assert "Only .txt or .pdf files are supported" in response.json()["detail"]
