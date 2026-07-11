# 🌾 AgriExpert: Voice-Enabled AI (RAG)

AgriExpert is an advanced agricultural assistant that uses **Retrieval-Augmented Generation (RAG)** to provide expert advice in multiple languages (Telugu, Hindi, and English) based on custom local PDF documents.

---

## 🚀 Step-by-Step Execution Guide

### 1. **Setup Your Environment**
Before running the project, ensure all dependencies are installed:
```bash
pip install -r agri_rag/requirements.txt
```

---

### 2. **Step 1: Ingest Your Agricultural Knowledge**
To prepare the "brain" of the assistant, process your PDF files (located in the `agri_rag/data/` folder):
```bash
python agri_rag/pdf_processor.py
```
*   **What Happens:** The script extracts text from PDFs, breaks it into smaller chunks, and uses **Gemini Embeddings** to store them in a local **ChromaDB** index (`agri_rag/chroma_db/`).
*   **Result:** A searchable digital library of your agricultural documents is created on your machine.

---

### 3. **Step 2: Launch the Interactive App**
To use the graphical and voice-enabled assistant, run:
```bash
streamlit run agri_rag/agri_gui.py
```
*   **What Happens:** This starts a local web server and opens a dashboard in your browser (usually at `http://localhost:8501`).
*   **Result:** You will see a user-friendly interface where you can ask questions in your language.

---

### 4. **Step 3: Get Expert Advice**
1. Select your preferred **Language** (Telugu, Hindi, or English).
2. Type a question (e.g., *"How to control pests in rice?"*).
3. Click **"Get Expert Advice"**.

*   **What Happens Internally:**
    1.  **Search:** The app finds the most relevant sections of your PDF.
    2.  **Generate:** It asks **Gemini 2.5 Flash** to answer using only that specific information.
    3.  **Translate:** Gemini provides a professional answer in the selected language.
    4.  **Voice:** The app converts the answer into a voice response (MP3).
*   **Result:** You see the expert's advice on screen and can listen to the audio playback.

---

## 📂 Project Structure

*   `agri_gui.py`: The main Streamlit web application.
*   `pdf_processor.py`: The logic for indexing your PDFs into the database.
*   `chroma_db/`: The vector database folder where searchable info is stored.
*   `data/`: Put your agricultural PDFs here.
*   `.env`: Securely stores your Google API Key.
*   `requirements.txt`: List of necessary Python libraries.

---

## 💡 Pro Tip:
If you add new PDF files to the `agri_rag/data/` folder, remember to **rerun Step 1** (`pdf_processor.py`) so the assistant can learn the new information!
