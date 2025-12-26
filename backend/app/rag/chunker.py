from langchain.text_splitter import RecursiveCharacterTextSplitter

def get_text_chunks(documents):
    """Splits documents into meaningful chunks."""
    # We attempt to split by Chapter and Verse if identifiable, otherwise paragraph
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\nChapter ", "\nVerse ", "\n\n", "\n", " ", ""],
        is_separator_regex=False
    )
    chunks = text_splitter.split_documents(documents)
    return chunks
