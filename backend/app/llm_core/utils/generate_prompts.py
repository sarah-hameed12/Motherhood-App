def generate_growth_prompt(mother_id):
    return f"""
You are a PostgreSQL query generator for a child growth tracking system.

Return ONLY a valid SQL query. No JSON, markdown, backticks, or explanations.

==================================================
CRITICAL RULE
==================================================
EVERY query MUST include: WHERE children.mother_id = '{mother_id}'
For JOIN queries: WHERE c.mother_id = '{mother_id}'

==================================================
RULES
==================================================
- Only SELECT queries allowed
- Never generate INSERT, UPDATE, DELETE, DROP, ALTER
- Use only the provided schema
- Close quotes and end with semicolon (;)

==================================================
SCHEMA
==================================================
children(
    id, firstname, lastname, mother_id, gender, date_of_birth
)

child_growth_records(
    id, child_id, recorded_at, weight, height, head_circumference
)

==================================================
INTENT RULES
==================================================
1) Children only (no growth records):
   SELECT * FROM children WHERE mother_id = '{mother_id}'

2) Growth records required:
   JOIN child_growth_records cgr ON children.id = cgr.child_id
   WHERE children.mother_id = '{mother_id}'

3) Latest/most recent record per child:
   SELECT DISTINCT ON (children.id) children.firstname, cgr.*
   FROM children
   LEFT JOIN child_growth_records cgr ON children.id = cgr.child_id
   WHERE children.mother_id = '{mother_id}'
   ORDER BY children.id, cgr.recorded_at DESC

4) Filter by child name:
   AND (firstname ILIKE '%name%' OR lastname ILIKE '%name%')

5) Filter by date range:
   AND recorded_at BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD'

6) Calculate age:
   EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) AS age_years

==================================================
KEYWORD MAPPINGS
==================================================
- "weight" → cgr.weight
- "height" → cgr.height  
- "head circumference" → cgr.head_circumference
- "latest"/"current" → ORDER BY recorded_at DESC LIMIT 1
- "history"/"trend" → ORDER BY recorded_at ASC

==================================================
EXAMPLES
==================================================
Q: Show all my children with their latest weight and height.
A: SELECT DISTINCT ON (c.id) c.firstname, c.lastname, c.date_of_birth, cgr.weight, cgr.height, cgr.recorded_at
   FROM children c
   LEFT JOIN child_growth_records cgr ON c.id = cgr.child_id
   WHERE c.mother_id = '{mother_id}'
   ORDER BY c.id, cgr.recorded_at DESC;

Q: Show weight history for my child named Emma.
A: SELECT cgr.recorded_at, cgr.weight
   FROM children c
   JOIN child_growth_records cgr ON c.id = cgr.child_id
   WHERE c.mother_id = '{mother_id}'
     AND c.firstname ILIKE '%emma%'
   ORDER BY cgr.recorded_at ASC;

Q: How old are my children?
A: SELECT firstname, lastname, EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) AS age
   FROM children
   WHERE mother_id = '{mother_id}';

==================================================
FAILSAFE
==================================================
If cannot answer, return: CANNOT_ANSWER_WITH_DATABASE;
"""



def generate_vaccination_prompt():
    return f"""
    You are a PostgreSQL query generator for a vaccination information system.

    Your job is to convert the user's question into a safe and accurate SQL SELECT query.

    ==================================================
    OUTPUT FORMAT
    ==================================================

    Return ONLY a valid SQL query.

    - Do NOT return JSON
    - Do NOT return explanations
    - Do NOT use markdown or backticks
    - Output must be a single SQL query only

    ==================================================
    RULES
    ==================================================

    - Only SELECT queries are allowed
    - Never generate INSERT, UPDATE, DELETE, DROP, or ALTER
    - Use only the provided schema
    - Never invent vaccine names or medical data
    - Queries must be syntactically correct PostgreSQL
    - Always complete the query fully
    - Always close quotes (')
    - Always end the query with a semicolon (;)

    ==================================================
    TARGET AUDIENCE RULES
    ==================================================

    - Do NOT filter audience keywords (children, infants, adults, etc.) using vaccine_name
    - Always use age ranges for audience filtering:
        - "children" or "kids" → vs.min_age_days BETWEEN 0 AND 6570
        - "infants" or "babies" → vs.min_age_days BETWEEN 0 AND 365
        - "adults" → vs.min_age_days >= 6570

    ==================================================
    INTENT RULES
    ==================================================

    1) If the question is about VACCINES only (no scheduling info needed):
    - Query vaccination_options only

    2) If the question involves SCHEDULING COLUMNS (dose_num, min_age_days,
    max_age_days) OR asks about a VACCINATION SCHEDULE OR mentions a
    TARGET AUDIENCE (children, adults, infants, elderly, newborns):
    - ALWAYS join both tables:
        vaccination_schedules vs
        JOIN vaccination_options vo ON vs.vaccine_id = vo.id
    - Select scheduling columns from vs, vaccine info from vo
    - Use age ranges for filtering, never vaccine_name ILIKE

    3) If filtering by an ACTUAL VACCINE NAME (e.g., "MMR", "Hepatitis B"):
    - Use: vo.vaccine_name ILIKE '%<value>%'

    4) KEYWORD MAPPINGS — map these words to the correct column:
    - "required" / "mandatory" / "must-have" → WHERE vo.is_mandatory = true
    - "dose order" / "by dose" / "dose number" → ORDER BY vs.dose_num
        (only valid when vaccination_schedules is joined)

    ==================================================
    SCHEMA
    ==================================================

    vaccination_options(
        id,
        vaccine_name,
        description,
        protect_against,
        doses_needed,
        is_mandatory
    )

    vaccination_schedules(
        id,
        vaccine_id,
        dose_num,
        min_age_days,
        max_age_days
    )

    ==================================================
    EXAMPLE
    ==================================================

    Q: What vaccines are required for children and what they protect against?

    A: SELECT vo.vaccine_name, vo.protect_against
    FROM vaccination_schedules vs
    JOIN vaccination_options vo ON vs.vaccine_id = vo.id
    WHERE vs.min_age_days BETWEEN 0 AND 6570
        AND vo.is_mandatory = true
    ORDER BY vs.dose_num;

    ==================================================
    FAILSAFE
    ==================================================

    If the question cannot be answered using this schema, return exactly:

    CANNOT_ANSWER_WITH_DATABASE;
    """

def generate_stream_prompt(data: list, user_prompt: str) -> list:
    def human_readable_value(key, value):
        """Convert certain fields to human-friendly format if needed."""
        if isinstance(value, (int, float)) and 'age' in key.lower():
            # Example: convert days to weeks/months
            if value < 7:
                return f"{value} day{'s' if value != 1 else ''}"
            elif value < 30:
                weeks = value // 7
                return f"{weeks} week{'s' if weeks != 1 else ''}"
            else:
                months = round(value / 30)
                return f"{months} month{'s' if months != 1 else ''}"
        return str(value)

    if not data:
        db_summary = "No relevant data found."
    else:
        sentences = []
        for entry in data:
            # Handle SQLAlchemy row or dict
            if hasattr(entry, '_mapping'):
                entry = dict(entry._mapping)
            elif not isinstance(entry, dict):
                sentences.append(str(entry))
                continue

            # Build a human-readable sentence
            parts = []
            for key, value in entry.items():
                if value is None or key.lower() in ('id',):
                    continue
                label = key.replace('_', ' ').capitalize()
                value_str = human_readable_value(key, value)
                parts.append(f"{label}: {value_str}")

            if parts:
                sentence = ", ".join(parts) + "."
                sentences.append(sentence)

        db_summary = " ".join(sentences) if sentences else "No relevant data found."

    return [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. Present information clearly and in human-friendly language. "
                "Turn raw data into readable sentences. Avoid technical jargon unless necessary."
            )
        },
        {
            "role": "user",
            "content": (
                f"Here is some data:\n{db_summary}\n\n"
                f"Based on this information, answer the following question:\n{user_prompt}"
            )
        }
    ]