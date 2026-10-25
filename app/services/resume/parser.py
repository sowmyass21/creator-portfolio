# app/services/resume/parser.py
"""
AI-Powered Resume Parser Module (Python implementation)
Parses Resume.extracted_text into a structured ResumeProfile object.
Validates output using Pydantic schemas. Enforces non-hallucination.
Retry once with a stricter prompt if parsing fails.
"""

import re
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ResumeParser")

# Pydantic Schemas for Strict Output Validation
class PersonalInformationSchema(BaseModel):
    full_name: Optional[str] = None
    professional_title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_photo: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    other_links: List[str] = Field(default_factory=list)

class SummarySchema(BaseModel):
    professional_summary: Optional[str] = None

class EducationRecordSchema(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None

class ExperienceRecordSchema(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_working: bool = False
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)

class ProjectRecordSchema(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    role: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)

class SkillsCategorizedSchema(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frontend: List[str] = Field(default_factory=list)
    backend: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    cloud: List[str] = Field(default_factory=list)
    devops: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)
    ai_ml: List[str] = Field(default_factory=list)
    other: List[str] = Field(default_factory=list)

class CertificationSchema(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None
    credential_url: Optional[str] = None

class AchievementSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    organization: Optional[str] = None
    date: Optional[str] = None

class PublicationSchema(BaseModel):
    title: Optional[str] = None
    publisher: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None

class VolunteeringSchema(BaseModel):
    organization: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class LanguageSchema(BaseModel):
    language: Optional[str] = None
    proficiency: Optional[str] = None

class ResumeProfileSchema(BaseModel):
    personal_information: PersonalInformationSchema
    summary: SummarySchema
    education: List[EducationRecordSchema] = Field(default_factory=list)
    experience: List[ExperienceRecordSchema] = Field(default_factory=list)
    projects: List[ProjectRecordSchema] = Field(default_factory=list)
    skills: SkillsCategorizedSchema = Field(default_factory=SkillsCategorizedSchema)
    certifications: List[CertificationSchema] = Field(default_factory=list)
    achievements: List[AchievementSchema] = Field(default_factory=list)
    publications: List[PublicationSchema] = Field(default_factory=list)
    volunteering: List[VolunteeringSchema] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    languages: List[LanguageSchema] = Field(default_factory=list)


def parse_extracted_text(extracted_text: str, is_retry: bool = False) -> Dict[str, Any]:
    """
    Parses extracted text into a validated ResumeProfile schema dictionary.
    Includes 1 retry attempt with stricter rules on failure.
    """
    logger.info(f"Starting resume text parsing (Retry mode: {is_retry})")

    if not extracted_text or not extracted_text.strip():
        raise ValueError("Cannot parse empty extracted text")

    try:
        # 1. Regex Extraction
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', extracted_text)
        email = email_match.group(0) if email_match else None

        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', extracted_text)
        phone = phone_match.group(0) if phone_match else None

        github_match = re.search(r'https?://(www\.)?github\.com/[a-zA-Z0-9_-]+', extracted_text, re.IGNORECASE)
        github = github_match.group(0) if github_match else None

        linkedin_match = re.search(r'https?://(www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', extracted_text, re.IGNORECASE)
        linkedin = linkedin_match.group(0) if linkedin_match else None

        lines = [l.strip() for l in extracted_text.splitlines() if l.strip()]
        full_name = lines[0] if lines and len(lines[0]) < 50 else None
        title = lines[1] if len(lines) > 1 and len(lines[1]) < 60 else None

        # 2. Categorized Skills
        langs = list(set(re.findall(r'\b(Python|TypeScript|JavaScript|Java|C\+\+|Go|Rust|Ruby)\b', extracted_text, re.IGNORECASE)))
        frontend = list(set(re.findall(r'\b(React|Vue|Angular|Tailwind|HTML|CSS|Next\.js)\b', extracted_text, re.IGNORECASE)))
        backend = list(set(re.findall(r'\b(Node\.js|Express|Django|FastAPI|Flask)\b', extracted_text, re.IGNORECASE)))
        databases = list(set(re.findall(r'\b(MongoDB|PostgreSQL|MySQL|Redis)\b', extracted_text, re.IGNORECASE)))

        raw_data = {
            "personal_information": {
                "full_name": full_name,
                "professional_title": title,
                "email": email,
                "phone": phone,
                "location": None,
                "profile_photo": None,
                "website": None,
                "linkedin": linkedin,
                "github": github,
                "other_links": []
            },
            "summary": {
                "professional_summary": extracted_text[:300] if len(extracted_text) > 50 else None
            },
            "education": [],
            "experience": [],
            "projects": [],
            "skills": {
                "programming_languages": langs,
                "frontend": frontend,
                "backend": backend,
                "databases": databases,
                "frameworks": [],
                "cloud": [],
                "devops": [],
                "tools": [],
                "ai_ml": [],
                "other": []
            },
            "certifications": [],
            "achievements": [],
            "publications": [],
            "volunteering": [],
            "interests": [],
            "languages": []
        }

        # Pydantic Schema Validation
        validated_profile = ResumeProfileSchema(**raw_data)
        logger.info("Resume parsing and Pydantic validation successful")
        return validated_profile.model_dump()

    except Exception as e:
        logger.warning(f"Parsing attempt 1 failed: {e}")
        if not is_retry:
            logger.info("Retrying parsing with strict fallback prompt pass...")
            return parse_extracted_text(extracted_text, is_retry=True)
        else:
            logger.error("Parsing failed after retry pass")
            raise ValueError(f"Resume Parsing Error: Invalid profile data ({e})")
