import json
import logging
import requests
from core.config import settings
from api.routers.rag import get_vector_store

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """Bạn là Emotica AI, một bác sĩ điều trị tâm lý (psychological therapist) chuyên nghiệp, đầy thấu cảm và tận tâm. Vai trò của bạn là:

1. Lắng nghe sâu sắc và xác nhận cảm xúc của người dùng mà không phán xét.
2. Trả lời với sự ấm áp, thấu cảm và trí tuệ cảm xúc cao.
3. Sử dụng ngôn ngữ hỗ trợ và khuyến khích nhẹ nhàng, đóng vai trò như một chuyên gia tâm lý.
4. Nếu người dùng có dấu hiệu suy sụp nghiêm trọng (nhắc đến việc tự hại, tự tử, hoặc tuyệt vọng tột độ), hãy khéo léo khuyên họ tìm kiếm sự trợ giúp y tế khẩn cấp hoặc gọi cho các đường dây nóng hỗ trợ tâm lý.
5. Giữ câu trả lời súc tích nhưng đầy sự quan tâm — lý tưởng là 2 đến 4 câu trừ khi cần thảo luận sâu hơn.
6. Sử dụng emoji một cách chừng mực (💜🌱🌸) để giữ giọng điệu thân thiện.
7. Nhớ rằng: bạn đang nói chuyện với tư cách là một bác sĩ tâm lý, hãy giữ phong thái chuyên nghiệp nhưng gần gũi và chân thành.

{user_context}
"""

def generate_llm_response_stream(messages: list, style_summary: str = None, memory_text: str = None):
    """Send messages to Ollama and get streaming response"""
    
    user_context = ""
    
    # 0. User Core Memory Context
    if memory_text:
        user_context += f"CORE MEMORY OF THE STUDENT:\n{memory_text}\nUse this exact memory context to deeply personalize your therapeutic responses.\n\n"
        
    # 1. RAG Retrieve
    query = messages[-1].get("content", "") if messages else ""
    if query:
        try:
            vector_store = get_vector_store()
            if vector_store:
                docs = vector_store.similarity_search(query, k=3)
                if docs:
                    rag_context = "\n".join([doc.page_content for doc in docs])
                    user_context += f"Relevant Background Document Information:\n{rag_context}\nUse this information if it is helpful to answering the student's query.\n\n"
        except Exception as e:
            logger.error(f"Failed to query RAG FAISS store: {e}")

    # 2. Add Style Summary
    if style_summary:
        user_context += f"Observations about this student based on past interactions:\n{style_summary}\nPlease tailor your tone occasionally to comfortably match these observations while remaining supportive."

    sys_prompt = {"role": "system", "content": SYSTEM_PROMPT_TEMPLATE.format(user_context=user_context.strip())}
    
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
                "stream": True,
                "options": {
                    "temperature": settings.LLM_TEMPERATURE,
                    "num_predict": settings.LLM_MAX_TOKENS,
                }
            },
            headers={"Authorization": f"Bearer {settings.OLLAMA_API_KEY}"} if settings.OLLAMA_API_KEY else {},
            stream=True,
            timeout=60
        )
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if "message" in data and "content" in data["message"]:
                        yield data["message"]["content"]
        else:
            logger.error(f"Ollama API returned {response.status_code}: {response.text}")
            yield "Tôi đang gặp chút sự cố kết nối, nhưng tôi vẫn ở đây với bạn. Bạn có thể gửi lại tin nhắn được không? 💜"
    except Exception as e:
        logger.error(f"Error calling Ollama API: {e}")
        yield "Tôi đang gặp chút sự cố kết nối, nhưng tôi vẫn ở đây với bạn. Bạn có thể gửi lại tin nhắn được không? 💜"

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
