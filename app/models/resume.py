# app/models/resume.py
"""Resume data model definition"""
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Experience:
    title: str
    company: str
    startDate: str = ""
    endDate: str = ""
    description: str = ""
    highlights: List[str] = field(default_factory=list)

@dataclass
class Education:
    degree: str
    institution: str
    startDate: str = ""
    endDate: str = ""

@dataclass
class ResumeModel:
    user_id: str
    original_filename: str
    status: str = "PENDING"
    raw_text: str = ""
    fullName: str = ""
    email: str = ""
    summary: str = ""
    skills: List[str] = field(default_factory=list)
    experience: List[Experience] = field(default_factory=list)
    education: List[Education] = field(default_factory=list)
