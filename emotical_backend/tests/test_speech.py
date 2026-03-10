import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
import torch

client = TestClient(app)

@patch("api.routers.speech.get_ser_model")
@patch("api.routers.speech.preprocess_audio")
def test_extract_emotion(mock_preprocess, mock_get_ser_model):
    # Mocking outputs
    mock_model = MagicMock()
    mock_model.config.id2label = {0: "Happy", 1: "Sad"}
    
    # Mock the forward pass output with logits
    mock_outputs = MagicMock()
    mock_outputs.logits = torch.tensor([[5.0, 1.0]]) # Index 0 gets highest value -> "Happy"
    mock_model.return_value = mock_outputs
    
    mock_extractor = MagicMock()
    mock_get_ser_model.return_value = (mock_model, mock_extractor)
    
    mock_preprocess.return_value = {"input_values": torch.tensor([[0.0]])}

    file_content = b"fake audio data"
    response = client.post(
        "/api/speech/emotion",
        files={"file": ("test.wav", file_content, "audio/wav")}
    )
    
    assert response.status_code == 200
    assert response.json()["emotion"] == "Happy"


@patch("api.routers.speech.get_stt_pipeline")
def test_transcribe_speech(mock_get_stt):
    mock_pipe = MagicMock()
    mock_pipe.return_value = {"text": "Hello world"}
    mock_get_stt.return_value = mock_pipe

    file_content = b"fake audio data"
    response = client.post(
        "/api/speech/transcribe",
        files={"file": ("test.wav", file_content, "audio/wav")}
    )
    
    assert response.status_code == 200
    assert response.json()["text"] == "Hello world"


@patch("api.routers.speech.get_tts_model")
def test_synthesize_speech(mock_get_tts):
    mock_model = MagicMock()
    mock_model.config.sampling_rate = 16000
    mock_outputs = MagicMock()
    mock_outputs.waveform = torch.zeros((1, 1000))
    mock_model.return_value = mock_outputs
    
    mock_tokenizer = MagicMock()
    mock_tokenizer.return_value = {"input_ids": torch.tensor([[1, 2, 3]])}
    
    mock_get_tts.return_value = (mock_model, mock_tokenizer)

    response = client.post(
        "/api/speech/synthesize",
        data={"text": "Hello", "lang": "en"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/wav"

def test_synthesize_invalid_lang():
    response = client.post(
        "/api/speech/synthesize",
        data={"text": "Hello", "lang": "fr"}
    )
    assert response.status_code == 400
