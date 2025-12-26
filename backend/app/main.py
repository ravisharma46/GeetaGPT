from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.rag.chat import generate_chat_response, get_rag_chain
import uvicorn
import os

app = FastAPI(title="GeetaGPT Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.on_event("startup")
async def startup_event():
    # Initialize RAG chain (indexes PDF if needed)
    try:
        get_rag_chain()
    except Exception as e:
        print(f"Error initializing RAG chain: {e}")
        # We don't exit here to allow debugging, but chat will fail.

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    async def stream_generator():
        try:
            async for chunk in generate_chat_response(request.message):
                yield chunk
        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(stream_generator(), media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
