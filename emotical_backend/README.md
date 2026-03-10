# Emotica AI - Backend System

This is the backend for the Emotica AI Therapeutic Companion application. It provides user authentication, manages chat history, tracks user emotions through conversations, and provides an integration layer with the Ollama LLM to offer personalized and empathetic chat responses.

## Tech Stack
* **Framework**: FastAPI (Python 3.14+)
* **Database**: MySQL, SQLAlchemy (ORM)
* **Task Queue**: Celery (Background Processing)
* **Message Broker**: Redis
* **Authentication**: JWT (JSON Web Tokens), Bcrypt
* **Testing**: Pytest, HTTPX

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Python 3.10+ (Tested on 3.14)
- MySQL Server
- Redis Server

### 2. Environment Setup
Create a `.env` file in the root of `emotical_backend/`:

```env
# Security
SECRET_KEY="your-super-secret-key-change-this"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database & Broker
DATABASE_URL="mysql+pymysql://root:Htt%40123456@localhost/emotica"
REDIS_URL="redis://localhost:6379/0"

# Ollama / LLM Details
OLLAMA_BASE_URL="https://ollama.com" # Example
OLLAMA_API_KEY="your_api_key_here"
LLM_MODEL="ministral-3:14b-cloud" # Example
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=1800
```

### 3. Install Dependencies
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Database Setup
Ensure your local MySQL server is running and the `emotica` database exists. Then, create the necessary tables:
```bash
python init_db.py
```

---

## 🏃 Running the Application

To fully run the backend, you need to start both the API server and the background Celery worker.

**Terminal 1: Start the API Server**
```bash
source venv/bin/activate
uvicorn main:app --reload
```
*The API will be available at: http://localhost:8000*
*Interactive Docs (Swagger UI) at: http://localhost:8000/docs*

**Terminal 2: Start the Celery Worker**
```bash
source venv/bin/activate
celery -A worker.celery_app worker --loglevel=info
```
*Make sure your local Redis server is running before this.*

---

## 🧪 Testing

A completely isolated test suite runs securely using an in-memory SQLite database (`test.db`). It tests Authentication, User Retrieval, Chat processes, and Feedback.

```bash
source venv/bin/activate
pytest tests/ -v
```

---

## 📖 API Documentation (Endpoints)

Below is a detailed list of available API endpoints. For interactive testing directly in your browser, start the server and visit `/docs`.

### Authentication (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user account.
* **Body:**
  ```json
  {
      "name": "User Name",
      "email": "user@example.com",
      "password": "securepassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
      "access_token": "eyJhbG...",
      "token_type": "bearer",
      "user": {"id": "user_xxx", "name": "User Name", "email": "user@example.com"}
  }
  ```

#### `POST /api/auth/login`
Authenticates a user and returns a JWT access token.
* **Body:**
  ```json
  {
      "email": "user@example.com",
      "password": "securepassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
      "access_token": "eyJhbG...",
      "token_type": "bearer",
      "user": {"id": "user_xxx", "name": "User Name", "email": "user@example.com"}
  }
  ```

#### `GET /api/auth/me`
Retrieves details of the currently authenticated user.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  {
      "id": "user_xxx",
      "name": "User Name",
      "email": "user@example.com",
      "created_at": "2023-10-25T12:00:00Z"
  }
  ```

---

### Chat (`/api/chat`)

#### `POST /api/chat`
Sends a chat message to the LLM. If the user is authenticated, it stores history and triggers background analysis of user state/emotions for personalized future responses.
* **Headers:** `Authorization: Bearer <token>` *(Optional)*
* **Body (Compatible with Ollama standard format):**
  ```json
  {
      "model": "ministral-3:14b-cloud",
      "messages": [
          {"role": "user", "content": "I feel a little overwhelmed today."}
      ],
      "stream": false
  }
  ```
* **Response (200 OK):**
  ```json
  {
      "model": "ministral-3:14b-cloud",
      "message": {
          "role": "assistant",
          "content": "Take a deep breath. It's perfectly okay to feel overwhelmed..."
      },
      "done": true
  }
  ```

#### `GET /api/chat/sessions`
Retrieves chat session history for the current user.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
      {
          "id": "session_xxx",
          "title": "New Conversation",
          "created_at": "2023-10-25T12:15:00Z"
      }
  ]
  ```

#### `GET /api/chat/sessions/{session_id}/messages`
Retrieves all prior messages inside a specific conversation session.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
  ```json
  [
      {
          "id": 1,
          "role": "user",
          "content": "Hi",
          "timestamp": "2023-10-25T12:15:00Z"
      },
      {
          "id": 2,
          "role": "assistant",
          "content": "Hello! How can I support you today?",
          "timestamp": "2023-10-25T12:15:05Z"
      }
  ]
  ```

---

### Feedback (`/api/feedback`)

#### `POST /api/feedback`
Submits platform/system feedback.
* **Body:**
  ```json
  {
      "rating": 5,
      "text": "The empathetic responses are really helpful.",
      "email": "optional_user@example.com"
  }
  ```
* **Response (201 Created):**
  ```json
  {
      "message": "Feedback submitted successfully"
  }
  ```
