from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from app.config import config
from app.rag.retriever import get_retriever
from app.rag.prompt import get_prompt_template

_rag_chain = None

def get_rag_chain():
    """Singleton to initialize and return the RAG chain."""
    global _rag_chain
    if _rag_chain:
        return _rag_chain

    print("Initializing RAG chain with OpenRouter...")
    llm = ChatOpenAI(
        model=config.LLM_MODEL,
        api_key=config.OPENROUTER_API_KEY,
        base_url=config.OPENROUTER_BASE_URL,
        temperature=0.3
    )

    retriever = get_retriever()
    prompt = get_prompt_template()

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    _rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    print("RAG chain initialized.")
    return _rag_chain

async def generate_chat_response(message: str):
    chain = get_rag_chain()
    async for chunk in chain.astream({"input": message}):
        if "answer" in chunk:
            yield chunk["answer"]
