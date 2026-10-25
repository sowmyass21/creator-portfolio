# app/schemas/portfolio.py
"""Portfolio API request and response validation schemas"""

class PortfolioCustomizationSchema:
    theme: str
    primaryColor: str
    accentColor: str

class PortfolioPublishSchema:
    customSlug: str
