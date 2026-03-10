import os
import torch
import librosa
import numpy as np
import scipy.io.wavfile as wavfile
import io
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor, pipeline, VitsModel, AutoTokenizer
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()

# Setup Local Storage
UPLOAD_DIR = "uploaded_audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -----------------
# 1. EMOTION RECOGNITION (SER)
# -----------------
SER_MODEL_ID = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
ser_model = None
ser_feature_extractor = None

def get_ser_model():
    global ser_model, ser_feature_extractor
    if ser_model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        ser_model = AutoModelForAudioClassification.from_pretrained(SER_MODEL_ID).to(device)
        ser_feature_extractor = AutoFeatureExtractor.from_pretrained(SER_MODEL_ID, do_normalize=True)
    return ser_model, ser_feature_extractor

def preprocess_audio(audio_path, feature_extractor, max_duration=30.0):
    audio_array, sampling_rate = librosa.load(audio_path, sr=None)
    max_length = int(feature_extractor.sampling_rate * max_duration)
    
    if len(audio_array) > max_length:
        audio_array = audio_array[:max_length]
    else:
        audio_array = np.pad(audio_array, (0, max_length - len(audio_array)))

    inputs = feature_extractor(
        audio_array,
        sampling_rate=feature_extractor.sampling_rate,
        max_length=max_length,
        truncation=True,
        return_tensors="pt",
    )
    return inputs

@router.post("/emotion", summary="Detect emotion from a speech audio file")
async def extract_emotion(file: UploadFile = File(...)):
    """
    Accepts an audio file and uses the Whisper fine-tuned SER model to predict the emotion.
    Returns emotions like Happy, Sad, Angry, etc.
    """
    if not (file.filename.endswith(".wav") or file.filename.endswith(".mp3")):
        raise HTTPException(status_code=400, detail="Only .wav or .mp3 audio files are supported")
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    try:
        model, extractor = get_ser_model()
        inputs = preprocess_audio(file_path, extractor)
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        inputs = {key: value.to(device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        predicted_id = torch.argmax(logits, dim=-1).item()
        predicted_label = model.config.id2label[predicted_id]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process emotion: {str(e)}")
        
    return {"emotion": predicted_label}


# -----------------
# 2. SPEECH-TO-TEXT (STT)
# -----------------
stt_pipeline = None

def get_stt_pipeline():
    global stt_pipeline
    if stt_pipeline is None:
        device = 0 if torch.cuda.is_available() else -1
        stt_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-base", device=device) 
        # Note: Using whisper-base here for VRAM efficiency instead of large-v3, as it takes up significantly less RAM than the huge V3 while maintaining good accuracy.
    return stt_pipeline

@router.post("/transcribe", summary="Transcribe speech to text")
async def transcribe_speech(file: UploadFile = File(...)):
    """
    Accepts an audio file and transcribes it into text using Whisper. Works for both EN and VI natively.
    """
    file_path = os.path.join(UPLOAD_DIR, "stt_" + file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    try:
        pipe = get_stt_pipeline()
        result = pipe(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {str(e)}")
        
    return {"text": result.get("text", "").strip()}

# -----------------
# 3. TEXT-TO-SPEECH (TTS)
# -----------------
tts_models = {}

def get_tts_model(lang_code: str):
    """lang_code: 'vi' or 'en'"""
    model_id = f"facebook/mms-tts-{'vie' if lang_code == 'vi' else 'eng'}"
    if model_id not in tts_models:
        tts_models[model_id] = {
            "model": VitsModel.from_pretrained(model_id),
            "tokenizer": AutoTokenizer.from_pretrained(model_id)
        }
    return tts_models[model_id]["model"], tts_models[model_id]["tokenizer"]

@router.post("/synthesize", summary="Synthesize text to speech (Vietnamese/English)")
async def synthesize_speech(text: str = Form(...), lang: str = Form("vi")):
    """
    Synthesizes the provided text into speech using Meta's Massively Multilingual Speech (MMS) VITS architecture.
    Accepts 'vi' for Vietnamese or 'en' for English.
    Returns the output audio as an embedded .wav stream.
    """
    if lang not in ["vi", "en"]:
        raise HTTPException(status_code=400, detail="Language must be 'vi' or 'en'")
        
    try:
        model, tokenizer = get_tts_model(lang)
        inputs = tokenizer(text, return_tensors="pt")

        with torch.no_grad():
            output = model(**inputs).waveform

        # Convert tensor to numpy and write to a byte buffer as a WAV file
        wav_buffer = io.BytesIO()
        waveform_np = output.squeeze().cpu().numpy()
        wavfile.write(wav_buffer, rate=model.config.sampling_rate, data=waveform_np)
        wav_buffer.seek(0)
        
        return StreamingResponse(wav_buffer, media_type="audio/wav")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to synthesize speech: {str(e)}")

