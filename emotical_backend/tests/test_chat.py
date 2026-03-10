from unittest.mock import patch
from services.llm import generate_llm_response

def test_chat_unauthenticated(client):
    # Send a chat message without auth token
    payload = {
        "model": "ministral-3:14b-cloud",
        "messages": [
            {"role": "user", "content": "I am feeling a bit stressed about exams."}
        ]
    }
    
    # We mock the actual LLM call to save time and API keys during tests
    with patch("api.routers.chat.generate_llm_response", return_value="It's completely normal to feel stressed. Have you tried taking a break? 💜"):
        response = client.post("/api/chat", json=payload)
        
    assert response.status_code == 200
    data = response.json()
    assert data["message"]["role"] == "assistant"
    assert "stressed" in data["message"]["content"]

def test_chat_authenticated(client, auth_headers):
    # Send an authenticated message to save context
    payload = {
        "messages": [
            {"role": "user", "content": "Hello, I need someone to talk to."}
        ]
    }
    
    with patch("api.routers.chat.generate_llm_response", return_value="I am here for you."):
        # Prevent Celery task trigger error in test if redis is offline
        with patch("api.routers.chat.analyze_chat_style.delay"):
            response = client.post("/api/chat", json=payload, headers=auth_headers)
            
    assert response.status_code == 200
    
    # Check that a session was created
    response_sessions = client.get("/api/chat/sessions", headers=auth_headers)
    assert response_sessions.status_code == 200
    sessions = response_sessions.json()
    assert len(sessions) > 0
    session_id = sessions[0]["id"]
    
    # Check messages inside that session
    response_msgs = client.get(f"/api/chat/sessions/{session_id}/messages", headers=auth_headers)
    assert response_msgs.status_code == 200
    msgs = response_msgs.json()
    assert len(msgs) == 2  # 1 User, 1 Assistant
    assert msgs[0]["role"] == "user"
    assert msgs[1]["role"] == "assistant"

def test_chat_missing_messages(client):
    payload = {"model": "llama3"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    assert "Messages list is required" in response.text
