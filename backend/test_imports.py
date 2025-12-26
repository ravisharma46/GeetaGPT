try:
    from langchain.chains import create_retrieval_chain
    print("Success: from langchain.chains import create_retrieval_chain")
except ImportError as e:
    print(f"Failed: {e}")

try:
    from langchain.chains.retrieval import create_retrieval_chain
    print("Success: from langchain.chains.retrieval import create_retrieval_chain")
except ImportError as e:
    print(f"Failed: {e}")

try:
    from langchain.chains.combine_documents import create_stuff_documents_chain
    print("Success: from langchain.chains.combine_documents import create_stuff_documents_chain")
except ImportError as e:
    print(f"Failed: {e}")
