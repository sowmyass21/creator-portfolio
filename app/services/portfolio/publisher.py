# app/services/portfolio/publisher.py
"""Portfolio publisher module"""

def publish(portfolio_obj: dict, custom_slug: str = None, base_url: str = "http://localhost:5173") -> dict:
    slug = custom_slug or portfolio_obj.get("slug", "portfolio")
    published_url = f"{base_url}/portfolio/{slug}"
    return {
        "success": True,
        "isPublished": True,
        "slug": slug,
        "publishedUrl": published_url
    }
