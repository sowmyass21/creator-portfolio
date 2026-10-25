# app/schemas/resume.py
"""Resume API request and response validation schemas"""

class ResumeUploadSchema:
    filename: str
    content: str

class ResumeResponseSchema:
    id: str
    status: str
    fullName: str
    email: str
