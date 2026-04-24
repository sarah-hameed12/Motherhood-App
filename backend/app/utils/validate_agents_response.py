import re


def extract_tables(query: str):
    tables = re.findall(r"from\s+(\w+)|join\s+(\w+)", query, re.IGNORECASE)
    return {t for pair in tables for t in pair if t}


def validate_sql_agent_output(model_output: str, prompt_type: str = "vaccination"):
    query = model_output.strip()
    
    if not query.lower().startswith("select"):
        return False, None
    
    
    # tables = extract_tables(query)
    
    # if not tables:
    #     return False, None
    
    if prompt_type == "chid_growth":
        if "mother_id" not in query.lower():
            return False, None
    
    return True, query