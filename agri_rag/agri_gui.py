import streamlit as st
import os
import base64
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

st.set_page_config(page_title="AgriExpert RAG", layout="centered")

def get_base64_audio(file_path):
    with open(file_path, "rb") as f:
        data = f.read()
        return base64.b64encode(data).decode()

def play_audio(file_path):
    b64 = get_base64_audio(file_path)
    md = f"""
        <audio id="audio-tag" autoplay="true" controls>
        <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
        </audio>
    """
    st.markdown(md, unsafe_allow_html=True)

@st.cache_resource
def get_rag_chain():
    api_key = os.getenv("GOOGLE_API_KEY") 
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
    
    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )
    # Using gemini-2.5-flash as requested (confirmed as working in this project environment)
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
    retrieval_chain = create_retrieval_chain(
        vectorstore.as_retriever(search_kwargs={"k": 5}), 
        document_chain
    )
    
    return retrieval_chain

st.title("🌾 AgriExpert: Voice-Enabled AI")
st.markdown("Ask agricultural questions and get answers in your language!")

# Initialize session state for audio control
if "audio_playing" not in st.session_state:
    st.session_state.audio_playing = False
if "voice_file" not in st.session_state:
    st.session_state.voice_file = None

# Sidebar for audio control
autoplay = st.sidebar.checkbox("Autoplay Voice", value=True)
mute_all = st.sidebar.checkbox("Mute All Audio", value=False)

# Main UI Logic
# Language Selection
lang_options = {"Telugu": "te", "Hindi": "hi", "English": "en"}
selected_lang = st.selectbox("Choose Language", options=list(lang_options.keys()))
lang_code = lang_options[selected_lang]

# Question Input
query = st.text_input("Ask your question here:")

# Audio control in main area if playing
if st.session_state.audio_playing and not mute_all:
    col1, col2 = st.columns([1, 4])
    with col1:
        if st.button("⏹ Stop Voice", key="stop_voice_main"):
            st.session_state.audio_playing = False
            st.session_state.voice_file = None
            st.rerun()
    with col2:
        st.info("Playing response voice...")

if st.button("Get Expert Advice"):
    if query:
        with st.spinner("Consulting knowledge base..."):
            qa_chain = get_rag_chain()
            
            target_lang = "English" if lang_code == "en" else ("Telugu" if lang_code == "te" else "Hindi")
            
            response = qa_chain.invoke({
                "input": query,
                "target_language": target_lang
            })
            
            answer = response["answer"]
            
            st.subheader("Expert Answer:")
            st.write(answer)
            
            # TTS
            voice_file = os.path.join(BASE_DIR, f"st_response_{lang_code}.mp3")
            
            tts = gTTS(text=answer, lang=lang_code)
            tts.save(voice_file)
            
            st.session_state.voice_file = voice_file
            st.session_state.audio_playing = True
            st.rerun() # Rerun to show audio player and stop button
    else:
        st.warning("Please enter a question.")

# Play audio if flag is set
if st.session_state.audio_playing and st.session_state.voice_file:
    if autoplay:
        play_audio(st.session_state.voice_file)
    else:
        st.audio(st.session_state.voice_file)


st.sidebar.info("Knowledge base powered by AGRICULTURE.pdf and ChromaDB.")
