def test_register_user(client):
    response = client.post("/api/auth/register", json={
        "name": "New Person",
        "email": "newbie@example.com",
        "password": "strongpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newbie@example.com"

def test_login_user(client):
    # Register first
    client.post("/api/auth/register", json={
        "name": "Login Tester",
        "email": "logintester@example.com",
        "password": "validpassword"
    })
    
    # Login
    response = client.post("/api/auth/login", json={
        "email": "logintester@example.com",
        "password": "validpassword"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    
def test_get_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
