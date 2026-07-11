import os
import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from gtts import gTTS
from dotenv import load_dotenv

# Define directories relative to the script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Load environment variables
load_dotenv(dotenv_path=ENV_PATH)

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your React app's URL (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    language: str = "en"

# Cache the RAG chain
_rag_chain = None

def get_rag_chain():
    global _rag_chain
    if _rag_chain is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in .env")
            
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
        
        vectorstore = Chroma(
            persist_directory=CHROMA_DIR,
            embedding_function=embeddings
        )
        # Using gemini-2.5-flash as requested
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
        
        prompt = ChatPromptTemplate.from_template("""
        You are a wise agriculture expert. Use the following retrieved context to answer the question.
        Provide a helpful, accurate answer in the requested language.
        If you don't know, say you don't know.

        Context: {context}
        Question: {input}
        Language: {target_language}

        Answer:
        """)
        
        document_chain = create_stuff_documents_chain(llm, prompt)
        _rag_chain = create_retrieval_chain(
            vectorstore.as_retriever(search_kwargs={"k": 5}), 
            document_chain
        )
    return _rag_chain

@app.post("/ask")
async def ask_question(request: QueryRequest):
    try:
        chain = get_rag_chain()
        
        lang_map = {"te": "Telugu", "hi": "Hindi", "en": "English"}
        target_lang = lang_map.get(request.language, "English")
        
        response = chain.invoke({
            "input": request.question,
            "target_language": target_lang
        })
        
        answer = response["answer"]
        
        # TTS to Base64
        voice_file = os.path.join(BASE_DIR, f"temp_voice_{request.language}.mp3")
        tts = gTTS(text=answer, lang=request.language)
        tts.save(voice_file)
        
        with open(voice_file, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode()
            
        # Optional: Clean up temp file
        # os.remove(voice_file)
        
        return {
            "answer": answer,
            "audio": audio_base64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
