import io
import base64
import requests
import json
from fastapi import APIRouter, File, UploadFile, HTTPException
from transformers import pipeline
from PIL import Image
from core.config import settings

router = APIRouter()

# Load model lazily
emotion_analyzer = None

def get_emotion_analyzer():
    global emotion_analyzer
    if emotion_analyzer is None:
        # Use a lightweight PyTorch vision-transformer model for emotion detection
        emotion_analyzer = pipeline("image-classification", model="dima806/facial_emotions_image_detection")
    return emotion_analyzer

@router.post("/emotion", summary="Detect facial emotions in an uploaded image")
async def detect_facial_emotion(file: UploadFile = File(...)):
    """
    Accepts an image file (.jpg, .jpeg, .png) and uses a Vision Transformer 
    to analyze the dominant facial emotion.
    Returns a JSON with the dominant emotion.
    """
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, or .png files are supported")
        
    try:
        # Read the image content directly into memory
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Ensure image is in RGB format for the model
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        analyzer = get_emotion_analyzer()
        results = analyzer(image)
        
        if not results:
            return {"emotion": "Neutral", "detail": "Analysis failed"}
            
        # The pipeline returns a list of dictionaries sorted by score
        dominant_emotion = results[0]["label"].capitalize()
        confidence = results[0]["score"]
        
        return {"emotion": dominant_emotion, "confidence": float(confidence)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")

@router.post("/analyze_detail", summary="Analyze detailed image contents via Vision LLM", description="Uses the configured SMALL_VL_MODEL to extract a Title and a comprehensive Summary of the uploaded photo.")
async def analyze_detail(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, or .png files are supported")
        
    try:
        contents = await file.read()
        b64_image = base64.b64encode(contents).decode('utf-8')
        
        prompt = "Look at this image very carefully. Provide a short, catchy Title for the image in the first sentence. Then, provide a detailed 2-paragraph Summary describing all important elements, colors, and context in the image. Reply in Vietnamese."
        
        # We use Ollama multimodal API
        payload = {
            "model": settings.SMALL_VL_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                    "images": [b64_image]
                }
            ],
            "stream": False,
            "options": {"temperature": 0.3, "num_predict": 600}
        }
        
        resp = requests.post(f"{settings.OLLAMA_BASE_URL}/api/chat", json=payload, headers={"Authorization": f"Bearer {settings.OLLAMA_API_KEY}"} if settings.OLLAMA_API_KEY else {}, timeout=120)
        
        if resp.status_code == 200:
            result = resp.json().get("message", {}).get("content", "")
            
            # Simple heuristic parsing: assume first line/sentence is title
            lines = [line.strip() for line in result.split("\n") if line.strip()]
            title = lines[0] if lines else "Untitled Image"
            summary = "\n".join(lines[1:]) if len(lines) > 1 else result
            
            return {
                "title": title.replace("**", ""),
                "summary": summary,
                "model_used": settings.SMALL_VL_MODEL
            }
        else:
            raise HTTPException(status_code=500, detail=f"Ollama VL inference failed: {resp.text}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision LLM Error: {str(e)}")
