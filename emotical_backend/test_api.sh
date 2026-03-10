#!/bin/bash

# Configuration
API_URL="http://localhost:8000/api"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="securepassword123"
NAME="Test User"

echo "========================================="
echo "🚀 EMOTICA AI BACKEND - CURL API TEST 🚀"
echo "========================================="
echo "Testing against: $API_URL"
echo ""

# 1. Register User
echo "1️⃣  Testing: POST /auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
     -H "Content-Type: application/json" \
     -d "{\"name\": \"$NAME\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"
echo ""

# 2. Login User
echo "2️⃣  Testing: POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"

# Extract Token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -oP '"access_token":"\K[^"]+')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token. Exiting."
    exit 1
fi
echo "✅ Token extracted successfully."
echo ""

# 3. Get Current User (Me)
echo "3️⃣  Testing: GET /auth/me"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
     -H "Authorization: Bearer $TOKEN")

echo "Response: $ME_RESPONSE"
echo ""

# 4. Send Chat Message
echo "4️⃣  Testing: POST /chat"
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/chat" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "model": "ministral-3:14b-cloud",
           "messages": [
             {"role": "user", "content": "Hello, I am testing the chat API!"}
           ],
           "stream": false
         }')

echo "Response: $CHAT_RESPONSE"
echo ""

# 5. Get Chat Sessions
echo "5️⃣  Testing: GET /chat/sessions"
SESSIONS_RESPONSE=$(curl -s -X GET "$API_URL/chat/sessions" \
     -H "Authorization: Bearer $TOKEN")

echo "Response: $SESSIONS_RESPONSE"

# Extract Session ID (first one)
SESSION_ID=$(echo "$SESSIONS_RESPONSE" | grep -oP '"id":"\K[^"]+' | head -n 1)
echo ""

# 6. Get Chat Messages for Session
if [ ! -z "$SESSION_ID" ]; then
    echo "6️⃣  Testing: GET /chat/sessions/$SESSION_ID/messages"
    MESSAGES_RESPONSE=$(curl -s -X GET "$API_URL/chat/sessions/$SESSION_ID/messages" \
         -H "Authorization: Bearer $TOKEN")
    echo "Response: $MESSAGES_RESPONSE"
    echo ""
else
    echo "⚠️ Skipping GET messages (No session found)."
    echo ""
fi

# 7. Submit Feedback
echo "7️⃣  Testing: POST /feedback"
FEEDBACK_RESPONSE=$(curl -s -X POST "$API_URL/feedback" \
     -H "Content-Type: application/json" \
     -d "{\"rating\": 5, \"text\": \"The API is working perfectly.\", \"email\": \"$EMAIL\"}")

echo "Response: $FEEDBACK_RESPONSE"
echo ""

echo "========================================="
echo "🎉 ALL TESTS COMPLETED 🎉"
echo "========================================="
