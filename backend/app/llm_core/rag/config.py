from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

PDF_PATH = BASE_DIR / "data/raw/new_born_data.pdf"
CHUNKS_PATH = BASE_DIR / "data/processed/chunks.json"

FAISS_INDEX_PATH = BASE_DIR / "vectorstore/faiss.index"
METADATA_PATH = BASE_DIR / "vectorstore/metadata.json"