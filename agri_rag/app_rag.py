import os
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from gtts import gTTS
from dotenv import load_dotenv

# Define directories relative to the script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_db")
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Load environment variables (API Key from .env)
load_dotenv(dotenv_path=ENV_PATH)

def get_answer_and_voice(question, language='te'):
    """
    RAG logic:
    1. Load ChromaDB.
    2. Retrieve relevant context.
    3. Prompt Gemini via LangChain.
    4. Convert response to voice.
    """
    
    # 1. Setup Embeddings and Vector Store
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )

    # 2. Setup LLM (Gemini)
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

    # 3. Create Custom Prompt
    template = """
    You are a wise agriculture expert. Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Provide the answer in {target_language}.

    Context: {context}
    Question: {question}

    Answer:
    """
    
    target_lang_name = {
        'te': 'Telugu',
        'hi': 'Hindi',
        'en': 'English'
    }.get(language, 'English')

    prompt = PromptTemplate(
        template=template, 
        input_variables=["context", "question"],
        partial_variables={"target_language": target_lang_name}
    )

    # 4. Setup Retrieval QA Chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
        chain_type_kwargs={"prompt": prompt}
    )

    # 5. Run Query
    print(f"Querying for: {question} (Language: {target_lang_name})")
    response = qa_chain.invoke({"query": question})
    answer = response["result"]

    print(f"Answer: {answer}")

    # 6. Voice Generation (TTS)
    tts = gTTS(text=answer, lang=language)
    voice_file = os.path.join(BASE_DIR, f"response_{language}.mp3")
    tts.save(voice_file)
    print(f"Voice saved to: {voice_file}")
    
    return answer, voice_file

if __name__ == "__main__":
    # Test Question in Telugu
    # Question: "What are the common pests in rice?"
    print("--- Agri RAG Test ---")
    try:
        get_answer_and_voice("వరి పంటలో వచ్చే ప్రధాన తెగుళ్లు ఏమిటి?", 'te')
    except Exception as e:
        import traceback
        traceback.print_exc()
