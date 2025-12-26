from langchain_community.document_loaders import PyPDFLoader
from app.config import config
import os

def load_pdf():
    """Reads the PDF from the local path."""
    if not os.path.exists(config.PDF_PATH):
        raise FileNotFoundError(f"PDF file not found at {config.PDF_PATH}")
    
    loader = PyPDFLoader(config.PDF_PATH)
    documents = loader.load()
    return documents
