import os
from langchain_community.vectorstores import FAISS
from app.config import config
from app.rag.loader import load_pdf
from app.rag.chunker import get_text_chunks
from app.rag.embeddings import get_embeddings

def get_vector_store():
    """
    Returns the FAISS vector store. 
    If index exists locally, load it.
    Else, process PDF, create index, and save it.
    """
    embeddings = get_embeddings()
    index_path = config.VECTOR_DB_PATH
    
    if os.path.exists(index_path):
        print(f"Loading existing FAISS index from {index_path}...")
        try:
            # allow_dangerous_deserialization is needed for loading local files in newer langchain
            # Since we created the file, it is safe.
            vector_store = FAISS.load_local(
                index_path, 
                embeddings, 
                allow_dangerous_deserialization=True
            )
            return vector_store
        except Exception as e:
            print(f"Failed to load index: {e}. Recreating...")
    
    print("Creating new FAISS index...")
    documents = load_pdf()
    chunks = get_text_chunks(documents)
    
    if not chunks:
        raise ValueError("No text chunks generated from PDF.")

    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local(index_path)
    print(f"FAISS index saved to {index_path}")
    
    return vector_store

def get_retriever():
    """Returns the retriever interface."""
    vector_store = get_vector_store()
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}
    )
