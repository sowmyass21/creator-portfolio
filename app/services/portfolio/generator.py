# app/services/portfolio/generator.py
"""Portfolio generator module"""

def generate_sections(normalized_data: dict, theme: str = "modern-minimal") -> dict:
    return {
        "hero": {
            "headline": normalized_data.get("fullName", "Creator"),
            "subheadline": normalized_data.get("summary", "")[:120]
        },
        "about": {
            "bio": normalized_data.get("summary", "")
        },
        "experience": normalized_data.get("experience", []),
        "skills": [{"category": "Core", "items": normalized_data.get("skills", [])}],
        "education": normalized_data.get("education", [])
    }
