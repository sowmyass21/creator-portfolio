# app/services/portfolio/renderer.py
"""Portfolio renderer module"""

def render_portfolio(portfolio_obj: dict) -> dict:
    return {
        "meta": portfolio_obj.get("meta", {}),
        "customization": portfolio_obj.get("customization", {}),
        "sections": portfolio_obj.get("sections", {})
    }
