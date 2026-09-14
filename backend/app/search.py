"""Thin Tavily wrapper. Returns a normalized list of {title, url, snippet}."""
from typing import List, Dict
from .config import TAVILY_API_KEY


def web_search(query: str, max_results: int = 5) -> List[Dict]:
    if not TAVILY_API_KEY:
        return []
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=TAVILY_API_KEY)
        resp = client.search(query=query, max_results=max_results,
                             search_depth="basic")
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": r.get("content", "")[:600],
            }
            for r in (resp.get("results") or [])
        ]
    except Exception as e:
        return [{"title": "search_error", "url": "", "snippet": str(e)[:200]}]
