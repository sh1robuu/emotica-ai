import os
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

router = APIRouter()

# Setup Local Storage
UPLOAD_DIR = "uploaded_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# FAISS Initialization
FAISS_INDEX_PATH = "faiss_index"

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_vector_store():
    embeddings = get_embeddings()
    if os.path.exists(FAISS_INDEX_PATH):
        return FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    return None

def save_vector_store(vector_store):
    vector_store.save_local(FAISS_INDEX_PATH)

@router.post("/documents", summary="Upload a document for RAG processing")
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts .txt or .pdf files, chunks the text, computes embeddings using `sentence-transformers`,
    and inserts the document chunks into the FAISS local vector store.
    """
    if not (file.filename.endswith(".txt") or file.filename.endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Only .txt or .pdf files are supported")
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    try:
        if file.filename.endswith(".txt"):
            loader = TextLoader(file_path)
        else:
            loader = PyPDFLoader(file_path)
            
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        embeddings = get_embeddings()
        vector_store = get_vector_store()
        
        if vector_store is None:
            vector_store = FAISS.from_documents(chunks, embeddings)
        else:
            vector_store.add_documents(chunks)
            
        save_vector_store(vector_store)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
        
    return {"message": f"Successfully processed {len(chunks)} chunks from {file.filename} into RAG store."}
