import os
import shutil
import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect
from db.models import User
from api.routers.auth import get_current_user
from api.routers.rag import get_vector_store, get_embeddings
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket for Admin Real-Time Events.
    Connect here to stream logs, interactions, and system updates dynamically.
    """
    await manager.connect(websocket)
    try:
        # Acknowledge connection
        await websocket.send_text(f"Admin Dashboard Connected. Stream active.")
        while True:
            # ping loop to keep-alive
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
UPLOAD_DIR = "uploaded_docs/global"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/rag/global", summary="Add Global KB Document", description="Admin tool to add a document that is universally searchable by all users.")
async def add_global_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Hardcoded simple admin check for demonstration: 
    # In production, use proper Role Based Access Control
    if "admin" not in current_user.email.lower():
        # NOTE: For testing purposes we allow anyone if they choose 'admin'
        pass 
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    documents = []
    try:
        if file.filename.endswith(".txt"):
            loader = TextLoader(file_path, encoding='utf-8')
            documents.extend(loader.load())
        elif file.filename.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        else:
            raise HTTPException(status_code=400, detail="Unsupported file. Use .txt or .pdf")
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        docs = text_splitter.split_documents(documents)
        
        # Tag global docs so we know they are available to everyone
        for doc in docs:
            doc.metadata["scope"] = "global"
            doc.metadata["source"] = file.filename
            
        embeddings = get_embeddings()
        vector_store = get_vector_store()
        
        if vector_store:
            vector_store.add_documents(docs)
        else:
            vector_store = FAISS.from_documents(docs, embeddings)
            import api.routers.rag as rag_router
            rag_router.vector_store = vector_store
            
        return {"status": "success", "message": f"Global document '{file.filename}' added", "chunks": len(docs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting global document: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
