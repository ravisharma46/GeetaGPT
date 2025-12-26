from langchain_huggingface import HuggingFaceEmbeddings
from app.config import config

def get_embeddings():
    """Returns the Local HuggingFace embedding model."""
    print(f"Loading local embeddings: {config.EMBEDDING_MODEL}...")
    return HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)
