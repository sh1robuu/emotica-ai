import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from transformers import pipeline
from PIL import Image

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
