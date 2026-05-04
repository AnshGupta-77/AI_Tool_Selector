"""
DuckDuckGo live web search module.
Hard-capped at 2.5 seconds total — never blocks the main response.
If the network is slow or DDG is down, returns empty list gracefully.
"""

import asyncio
import re
from typing import List, Dict, Any
from urllib.parse import quote_plus

import httpx


# Strict per-request timeouts — connect fast or fail fast
_TIMEOUT = httpx.Timeout(
    connect=1.5,   # Give up connecting after 1.5s
    read=2.0,      # Give up reading after 2s
    write=1.0,
    pool=1.0,
)

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}


async def search_web_for_tools(task: str, max_results: int = 6) -> List[Dict[str, Any]]:
    """
    Non-blocking web search. Returns results or empty list within 3 seconds.
    Never raises — all exceptions are caught internally.
    """
    try:
        # Race between DDG instant-answer API and a short timeout
        result = await asyncio.wait_for(
            _ddg_instant_answer(task, max_results),
            timeout=2.5
        )
        return result
    except asyncio.TimeoutError:
        print("[search] Web search timed out — skipping, using local results only")
        return []
    except Exception as e:
        print(f"[search] Web search error: {e}")
        return []


async def _ddg_instant_answer(task: str, max_results: int) -> List[Dict[str, Any]]:
    """Query DDG Instant Answer JSON API."""
    query = quote_plus(f"best AI tools for {task}")
    url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"

    results: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(
        timeout=_TIMEOUT,
        follow_redirects=False,  # Don't follow redirects — saves round-trips
        http2=False,
    ) as client:
        try:
            resp = await client.get(url, headers=_HEADERS)
            if resp.status_code != 200:
                return []

            data = resp.json()

            # Abstract (top result)
            if data.get("AbstractText") and data.get("AbstractURL"):
                results.append({
                    "title": data.get("Heading", "").strip(),
                    "url": data["AbstractURL"],
                    "snippet": data["AbstractText"][:200],
                })

            # Related topics
            for topic in data.get("RelatedTopics", [])[:max_results]:
                if not isinstance(topic, dict):
                    continue
                text = topic.get("Text", "").strip()
                link = topic.get("FirstURL", "")
                if text and link and "duckduckgo.com" not in link:
                    results.append({
                        "title": text[:80],
                        "url": link,
                        "snippet": text[:200],
                    })

        except (httpx.TimeoutException, httpx.ConnectError, httpx.RemoteProtocolError):
            pass  # Network issue — return whatever we have so far
        except Exception:
            pass

    return results[:max_results]
