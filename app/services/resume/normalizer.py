# app/services/resume/normalizer.py
"""Resume data normalizer module"""

def normalize_data(parsed_data: dict) -> dict:
    return {
        "fullName": parsed_data.get("fullName", "").strip(),
        "email": parsed_data.get("email", "").strip(),
        "summary": parsed_data.get("summary", "").strip(),
        "skills": [s for s in parsed_data.get("skills", []) if s],
        "experience": parsed_data.get("experience", []),
        "education": parsed_data.get("education", [])
    }
