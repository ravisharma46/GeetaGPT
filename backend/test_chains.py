import sys
print(sys.path)
try:
    import langchain
    print(f"LangChain version: {langchain.__version__}")
    from langchain.chains import create_retrieval_chain
    print("Success: from langchain.chains import create_retrieval_chain")
except ImportError as e:
    print(f"Failed: {e}")
except Exception as e:
    print(f"Error: {e}")
