import json
import logging
import requests
from core.config import settings
from api.routers.rag import get_vector_store

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are Emotica AI, a compassionate and empathetic AI therapy companion designed specifically for students. Your role is to:

1. Listen actively and validate the student's feelings without judgment.
2. Respond with warmth, empathy, and emotional intelligence.
3. Use supportive language and gentle encouragement.
4. If the student seems to be in severe distress (mentions self-harm, suicide, or extreme hopelessness), gently suggest they reach out to a trusted adult, school counselor, or crisis helpline (988 Suicide & Crisis Lifeline, or text HOME to 741741).
5. Never diagnose, prescribe, or replace professional mental health support.
6. Keep responses concise but caring — 2 to 4 sentences is ideal unless deeper discussion is needed.
7. Use occasional emojis (💜🌱🌸) to keep the tone warm and approachable.
8. Remember: you are speaking to students — be age-appropriate, relatable, and kind.

You are NOT a doctor, therapist, or counselor. You are a supportive AI friend.

{user_context}
"""

def generate_llm_response(messages: list, style_summary: str = None) -> str:
    """Send messages to Ollama and get response"""
    
    user_context = ""
    
    # 1. RAG Retrieve
    query = messages[-1].get("content", "") if messages else ""
    if query:
        try:
            vector_store = get_vector_store()
            if vector_store:
                docs = vector_store.similarity_search(query, k=3)
                if docs:
                    rag_context = "\n".join([doc.page_content for doc in docs])
                    user_context += f"\nRelevant Background Document Information:\n{rag_context}\nUse this information if it is helpful to answering the student's query.\n"
        except Exception as e:
            logger.error(f"Failed to query RAG FAISS store: {e}")

    # 2. Add Style Summary
    if style_summary:
        user_context = f"\nObservations about this student based on past interactions:\n{style_summary}\nPlease tailor your tone occasionally to comfortably match these observations while remaining supportive."

    sys_prompt = {"role": "system", "content": SYSTEM_PROMPT_TEMPLATE.format(user_context=user_context)}
    
    # Prepend or replace system prompt
    formatted_messages = [sys_prompt]
    for msg in messages:
        if msg.get("role") != "system":
            formatted_messages.append(msg)
            
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.LLM_MODEL,
                "messages": formatted_messages,
                "stream": False,
                "options": {
                    "temperature": settings.LLM_TEMPERATURE,
                    "num_predict": settings.LLM_MAX_TOKENS,
                }
            },
            headers={"Authorization": f"Bearer {settings.OLLAMA_API_KEY}"} if settings.OLLAMA_API_KEY else {},
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("message", {}).get("content", "")
        else:
            logger.error(f"Ollama API returned {response.status_code}: {response.text}")
            return "I'm having a little trouble connecting right now, but I'm still here for you. Could you try sending your message again? 💜"
    except Exception as e:
        logger.error(f"Error calling Ollama API: {e}")
        return "I'm having a little trouble connecting right now, but I'm still here for you. Could you try sending your message again? 💜"

def generate_user_style_summary(chat_log: str, existing_summary: str = None) -> str:
    """Use LLM to extract a style summary of the user"""
    prompt = f"""
    Based on the following conversation log, briefly summarize the student's communication style, preferred tone, and any recurring themes or stressors. 
    Keep it under 3-4 sentences. It will be used as internal context to personalize future responses.
    
    Recent Chat Log:
    {chat_log}
    """
    if existing_summary:
        prompt += f"\n\nExisting observations:\n{existing_summary}\nPlease integrate the new information into this summary."

    messages = [{"role": "user", "content": prompt}]
    
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.LLM_MODEL,
                "messages": messages,
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 200}
            },
            headers={"Authorization": f"Bearer {settings.OLLAMA_API_KEY}"} if settings.OLLAMA_API_KEY else {},
            timeout=30
        )
        if response.status_code == 200:
            return response.json().get("message", {}).get("content", "").strip()
    except Exception as e:
        logger.error(f"Error summarising user style: {e}")
    return None
