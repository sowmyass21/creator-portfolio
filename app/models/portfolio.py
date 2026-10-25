# app/models/portfolio.py
"""Portfolio data model definition"""
from dataclasses import dataclass, field
from typing import List, Dict, Any

@dataclass
class PortfolioModel:
    user_id: str
    slug: str
    title: str = "My Portfolio"
    theme: str = "modern-minimal"
    is_published: bool = False
    published_url: str = ""
    sections: Dict[str, Any] = field(default_factory=dict)
    customization: Dict[str, Any] = field(default_factory=dict)
