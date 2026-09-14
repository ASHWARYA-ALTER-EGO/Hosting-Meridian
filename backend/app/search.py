"""Tavily wrapper with retry + graceful degradation."""
import time
from typing import List, Dict
from .config import TAVILY_API_KEY
from .logging_setup import get_logger

log = get_logger("search")


def web_search(query: str, max_results: int = 5) -> List[Dict]:
    """Search with exponential backoff on transient failures.
    Returns [] on total failure so the pipeline keeps moving instead of crashing."""
    if not TAVILY_API_KEY:
        log.warning("no TAVILY_API_KEY set; search disabled")
        return []

    from tavily import TavilyClient
    client = TavilyClient(api_key=TAVILY_API_KEY)

    last_err = None
    for attempt in range(3):
        try:
            resp = client.search(query=query, max_results=max_results, search_depth="basic")
            results = resp.get("results") or []
            log.info(f"tavily ok  query={query[:60]!r} results={len(results)} attempt={attempt+1}")
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "snippet": (r.get("content") or "")[:600],
                }
                for r in results
            ]
        except Exception as e:
            last_err = e
            wait = 1.5 * (2 ** attempt)
            log.warning(f"tavily err attempt={attempt+1} query={query[:60]!r} err={type(e).__name__}: {e}; sleeping {wait:.1f}s")
            time.sleep(wait)

    log.error(f"tavily giving up query={query[:60]!r} last_err={last_err}")
    return []
