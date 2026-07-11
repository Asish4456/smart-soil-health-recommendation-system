#!/bin/bash
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Rebuilding ChromaDB vector store..."
python pdf_processor.py 2>/dev/null || echo "ChromaDB rebuild skipped - will use existing or fail gracefully"
