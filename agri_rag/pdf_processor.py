import os
import time
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

# Define directories relative to the script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Load environment variables (API Key from .env)
load_dotenv(dotenv_path=ENV_PATH)

def ingest_pdfs(pdf_dir=None, db_dir=None):
    """
    Reads PDFs, chunks text, and stores in ChromaDB with batching and rate limiting.
    """
    if pdf_dir is None:
        pdf_dir = os.path.join(BASE_DIR, "data")
    if db_dir is None:
        db_dir = os.path.join(BASE_DIR, "chroma_db")
    if not os.path.exists(pdf_dir):
        print(f"Error: Directory {pdf_dir} does not exist.")
        return

    all_text = ""
    for filename in os.listdir(pdf_dir):
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(pdf_dir, filename)
            print(f"Extracting text from {filename}...")
            try:
                reader = PdfReader(pdf_path)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        all_text += text + "\n"
            except Exception as e:
                print(f"Error reading {filename}: {e}")

    if not all_text:
        print("No text extracted from PDFs.")
        return

    # 2. Chunk the text
    print("Chunking text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    chunks = text_splitter.split_text(all_text)
    print(f"Created {len(chunks)} chunks.")

    # 3. Create Vector Store with batching
    print("Creating/Updating vector store in", db_dir)
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=os.getenv("GOOGLE_API_KEY"))
    
    # Initialize Chroma
    vectorstore = Chroma(
        persist_directory=db_dir,
        embedding_function=embeddings
    )
    
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        print(f"Ingesting batch {i//batch_size + 1} of {(len(chunks)-1)//batch_size + 1}...")
        try:
            vectorstore.add_texts(texts=batch)
            # Small delay to avoid aggressive rate limiting
            time.sleep(1) 
        except Exception as e:
            print(f"Error ingesting batch: {e}")
            # Wait longer on error
            time.sleep(5)
            # Retry once
            try:
                vectorstore.add_texts(texts=batch)
            except Exception as e2:
                print(f"Retry failed: {e2}")

    print("Ingestion complete. ChromaDB created.")

if __name__ == "__main__":
    ingest_pdfs()
