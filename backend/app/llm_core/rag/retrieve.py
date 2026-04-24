# import faiss
import json
import numpy as np
# from sentence_transformers import SentenceTransformer
from pathlib import Path
from .config import BASE_DIR
import sys

VECTORSTORE_DIR = BASE_DIR / "vectorstore"
FAISS_FLAT_PATH = VECTORSTORE_DIR / "faiss_flat.index"
FAISS_IVF_PATH = VECTORSTORE_DIR / "faiss_ivf.index"
METADATA_PATH = VECTORSTORE_DIR / "metadata.json"

def check_and_load_resources():
    if not FAISS_FLAT_PATH.exists():
        if VECTORSTORE_DIR.exists():
            for file in VECTORSTORE_DIR.iterdir():
                pass
        sys.exit(1)
    
    if not METADATA_PATH.exists():
        sys.exit(1)

check_and_load_resources()

# model = SentenceTransformer("all-MiniLM-L6-v2")

# index = faiss.read_index(str(FAISS_FLAT_PATH))


with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

embedding_meta_path = VECTORSTORE_DIR / "embedding_metadata.json"
if embedding_meta_path.exists():
    with open(embedding_meta_path, "r", encoding="utf-8") as f:
        embedding_meta = json.load(f)


def preprocess_query(query: str) -> str:
    typos = {
        "brest": "breast",
        "benifit": "benefit",
        "benifits": "benefits",
        "feediing": "feeding",
        "formulla": "formula",
        "vaccin": "vaccine",
        "developement": "development",
        "mileston": "milestone",
        "sooth": "soothe",
        "colick": "colic",
    }
    
    corrected_query = query.lower()
    for typo, correct in typos.items():
        corrected_query = corrected_query.replace(typo, correct)
    
    expansions = {
        "breastfeed": ["breastfeeding", "breast milk", "nursing", "latch", "milk supply"],
        "formula": ["bottle feeding", "infant formula"],
        "sleep": ["bedtime", "nap", "night waking", "sleep routine", "safe sleep", "SIDS"],
        "cry": ["crying", "colic", "soothe", "calm", "fussy"],
        "food": ["solid foods", "weaning", "complementary feeding", "first foods"],
        "vaccine": ["vaccination", "immunization", "shots"],
        "development": ["milestones", "growth", "motor skills"],
    }
    
    enhanced = corrected_query
    for key, expansion_list in expansions.items():
        if key in corrected_query:
            enhanced += " " + " ".join(expansion_list[:2])
    
    return enhanced


def search(query: str, k: int = 3, show_details: bool = True):
    # enhanced_query = preprocess_query(query)
    
    # query_vec = model.encode([enhanced_query], normalize_embeddings=True).astype("float32")
    
    # k = min(k, index.ntotal)
    # distances, indices = index.search(query_vec, k)
    
    # results = []
    # for i, idx in enumerate(indices[0]):
    #     if idx >= 0 and idx < len(metadata):
    #         chunk = metadata[idx]
    #         results.append({
    #             "content": chunk["content"],
    #             "score": float(distances[0][i]),
    #             "id": idx,
    #             "metadata": chunk.get("metadata", {})
    #         })
    
    # return results

    pass


def format_results(results, show_full_content=False):
    if not results:
        return
    
    for i, result in enumerate(results, 1):
        section = result["metadata"].get("section", "")
        content = result["content"]
        if show_full_content:
            pass
        else:
            preview = content[:500]
            if len(content) > 500:
                preview += "..."


def get_context_for_llm(query: str, k: int = 3) -> str:
    results = search(query, k, show_details=False)
    
    context_parts = []
    for i, result in enumerate(results, 1):
        section = result["metadata"].get("section", "")
        if section:
            context_parts.append(f"[Section: {section}]\n{result['content']}")
        else:
            context_parts.append(result['content'])
    
    return "\n\n---\n\n".join(context_parts)

# if __name__ == "__main__":
#     test_query = "brest feeding benifits for mothers"
    
#     results = search(test_query, k=3, show_details=True)
#     format_results(results, show_full_content=False)
    
#     if results:
#         response = input("Show full content of first result? (y/n): ")
#         if response.lower() == 'y':
#             pass
    
#     while True:
#         query = input("\n🤔 Your question: ").strip()
#         if query.lower() in ['quit', 'exit', 'q']:
#             break
        
#         if not query:
#             continue
        
#         results = search(query, k=3, show_details=True)
#         format_results(results, show_full_content=False)