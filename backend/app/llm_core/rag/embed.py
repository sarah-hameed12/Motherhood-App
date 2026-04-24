import json
# import faiss
import numpy as np
# from sentence_transformers import SentenceTransformer
from pathlib import Path
from typing import List, Dict


# model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embeddings_with_metadata(chunks: List[Dict]) -> tuple:
    # texts = []
    # enhanced_texts = []
    
    # for chunk in chunks:
    #     content = chunk["content"]
        
    #     metadata = chunk.get("metadata", {})
    #     section = metadata.get("section", "")
        
    #     if section:
    #         enhanced_text = f"[{section}] {content}"
    #         enhanced_texts.append(enhanced_text)
    #     else:
    #         enhanced_texts.append(content)
        
    #     texts.append(content)
    
    # embeddings = model.encode(
    #     enhanced_texts,
    #     show_progress_bar=True,
    #     normalize_embeddings=True,
    #     batch_size=32
    # )
    
    # embeddings = np.array(embeddings).astype("float32")
    
    # return embeddings, texts

    pass


def create_faiss_index(embeddings: np.ndarray, chunks: List[Dict]):
    # dim = embeddings.shape[1]
    
    # index_flat = faiss.IndexFlatIP(dim)
    # index_flat.add(embeddings)
    
    # nlist = min(100, len(chunks) // 10)
    # if nlist > 1:
    #     quantizer = faiss.IndexFlatIP(dim)
    #     index_ivf = faiss.IndexIVFFlat(quantizer, dim, nlist, faiss.METRIC_INNER_PRODUCT)
        
    #     index_ivf.train(embeddings)
    #     index_ivf.add(embeddings)
    #     index_ivf.nprobe = 10
        
    #     return index_flat, index_ivf
    
    # return index_flat, None
    return


def save_metadata_with_stats(chunks: List[Dict], metadata_path: Path):
    for i, chunk in enumerate(chunks):
        if "metadata" not in chunk:
            chunk["metadata"] = {}
        
        chunk["metadata"]["index_id"] = i
        chunk["metadata"]["word_count"] = len(chunk["content"].split())
        
        if "section" in chunk["metadata"]:
            section_parts = chunk["metadata"]["section"].split(" > ")
            chunk["metadata"]["section_levels"] = section_parts
            chunk["metadata"]["main_section"] = section_parts[0] if section_parts else ""
    
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

# def main():
#     with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
#         chunks = json.load(f)
    
#     embeddings, texts = create_embeddings_with_metadata(chunks)
    
#     index_flat, index_ivf = create_faiss_index(embeddings, chunks)
    
#     Path(FAISS_INDEX_PATH).parent.mkdir(parents=True, exist_ok=True)
    
#     flat_index_path = FAISS_INDEX_PATH.parent / "faiss_flat.index"
#     faiss.write_index(index_flat, str(flat_index_path))
    
#     if index_ivf:
#         ivf_index_path = FAISS_INDEX_PATH.parent / "faiss_ivf.index"
#         faiss.write_index(index_ivf, str(ivf_index_path))
    
#     save_metadata_with_stats(chunks, METADATA_PATH)
    
#     embedding_meta = {
#         "model_name": "all-MiniLM-L6-v2",
#         "dimension": embeddings.shape[1],
#         "num_chunks": len(chunks),
#         "normalized": True,
#         "metric": "inner_product"
#     }
    
#     embedding_meta_path = METADATA_PATH.parent / "embedding_metadata.json"
#     with open(embedding_meta_path, "w", encoding="utf-8") as f:
#         json.dump(embedding_meta, f, indent=2)

# if __name__ == "__main__":
#     main()