import fitz
from typing import List, Dict


def extract_text_with_structure(pdf_path: str) -> List[Dict]:
    doc = fitz.open(pdf_path)
    structured_pages = []
    
    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict")
        
        for block in blocks.get("blocks", []):
            if "lines" in block:
                for line in block["lines"]:
                    line_text = ""
                    font_size = 0
                    
                    for span in line["spans"]:
                        font_size = max(font_size, span.get("size", 0))
                        line_text += span["text"]
                    
                    line_text = line_text.strip()
                    if not line_text or len(line_text) < 3:
                        continue
                    
                    is_heading = font_size > 12 or (line_text.isupper() and len(line_text.split()) < 10)
                    
                    structured_pages.append({
                        "page": page_num + 1,
                        "text": line_text,
                        "is_heading": is_heading,
                        "font_size": font_size
                    })
    
    return structured_pages


def semantic_chunking(structured_content: List[Dict], chunk_size: int = 500, overlap: int = 100) -> List[Dict]:
    chunks = []
    current_chunk = []
    current_length = 0
    chunk_id = 0
    section_stack = []
    
    for i, item in enumerate(structured_content):
        text = item["text"]
        is_heading = item["is_heading"]
        
        if is_heading:
            if section_stack and section_stack[-1].get("level") == "main":
                section_stack.pop()
            section_stack.append({
                "heading": text,
                "level": "main" if i == 0 or structured_content[i-1]["is_heading"] else "sub"
            })
        
        context_prefix = " > ".join([s["heading"] for s in section_stack]) if section_stack else ""
        text_length = len(text.split())
        
        if current_length + text_length > chunk_size and current_chunk:
            chunk_text = " ".join([chunk_item["text"] for chunk_item in current_chunk])
            
            chunks.append({
                "id": chunk_id,
                "content": chunk_text,
                "source": "newborn_care",
                "metadata": {
                    "section": context_prefix,
                    "page": item["page"],
                    "word_count": current_length,
                    "has_heading": any(c.get("is_heading", False) for c in current_chunk)
                }
            })
            
            overlap_items = []
            overlap_length = 0
            for overlap_item in reversed(current_chunk):
                item_length = len(overlap_item["text"].split())
                if overlap_length + item_length <= overlap:
                    overlap_items.insert(0, overlap_item)
                    overlap_length += item_length
                else:
                    break
            
            current_chunk = overlap_items
            current_length = overlap_length
            chunk_id += 1
        
        current_chunk.append(item)
        current_length += text_length
    
    if current_chunk:
        chunk_text = " ".join([chunk_item["text"] for chunk_item in current_chunk])
        chunks.append({
            "id": chunk_id,
            "content": chunk_text,
            "source": "newborn_care",
            "metadata": {
                "section": " > ".join([s["heading"] for s in section_stack]),
                "word_count": current_length
            }
        })
    
    return chunks


def clean_chunks(chunks: List[Dict]) -> List[Dict]:
    seen_content = set()
    cleaned_chunks = []
    
    for chunk in chunks:
        content = " ".join(chunk["content"].split())
        
        if len(content.split()) < 10:
            continue
        
        key = content[:200]
        if key in seen_content:
            continue
        
        seen_content.add(key)
        chunk["content"] = content
        cleaned_chunks.append(chunk)
    
    return cleaned_chunks


# def main():
#     structured = extract_text_with_structure(PDF_PATH)
#     chunks = semantic_chunking(structured)
#     chunks = clean_chunks(chunks)
    
#     Path(CHUNKS_PATH.parent).mkdir(parents=True, exist_ok=True)
    
#     with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
#         json.dump(chunks, f, indent=2, ensure_ascii=False)

# if __name__ == "__main__":
#     main()