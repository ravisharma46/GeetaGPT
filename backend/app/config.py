import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    PDF_PATH = os.getenv("PDF_PATH", "./app/data/bhagavad_gita.pdf")
    VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "faiss_index")
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    LLM_MODEL = "tngtech/deepseek-r1t2-chimera:free"
    OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

    if not OPENROUTER_API_KEY:
        print("WARNING: OPENROUTER_API_KEY is not set.")

config = Config()
