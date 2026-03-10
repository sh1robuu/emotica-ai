def test_submit_feedback(client):
    payload = {
        "rating": 5,
        "text": "This AI is great!",
        "email": "user@example.com"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 201
    assert response.json() == {"message": "Feedback submitted successfully"}

def test_submit_feedback_no_email(client):
    payload = {
        "rating": 4,
        "text": "Helpful"
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 201
