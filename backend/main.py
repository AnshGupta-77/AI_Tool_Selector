"""
AI Tool Selector — FastAPI Backend
Run with: uvicorn main:app --reload --port 8000
"""

import json
import asyncio
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models import (
    SearchRequest, SearchResponse, ToolResult, ComparisonTable,
    ComparisonRow, CategoryResponse, ToolDetailResponse, CompareRequest
)
from search import search_web_for_tools
from ai_engine import analyze_and_recommend, generate_comparison

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Tool Selector API",
    description="Find the perfect AI tools for any task",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load tools DB ──────────────────────────────────────────────────────────
DB_PATH = Path(__file__).parent / "tools_db.json"

with open(DB_PATH, "r") as f:
    TOOLS_DB: List[dict] = json.load(f)

CATEGORY_META = {
    "writing":      {"label": "Writing & Content",  "icon": "✍️",  "color": "#6366f1"},
    "coding":       {"label": "Coding & Dev",        "icon": "💻",  "color": "#22c55e"},
    "image":        {"label": "Image & Art",         "icon": "🎨",  "color": "#f59e0b"},
    "video":        {"label": "Video",               "icon": "🎬",  "color": "#ef4444"},
    "audio":        {"label": "Audio & Music",       "icon": "🎵",  "color": "#8b5cf6"},
    "design":       {"label": "Design & UI",         "icon": "🖌️",  "color": "#06b6d4"},
    "productivity": {"label": "Productivity",        "icon": "⚡",  "color": "#f97316"},
    "research":     {"label": "Research",            "icon": "🔬",  "color": "#10b981"},
    "business":     {"label": "Business & Sales",    "icon": "💼",  "color": "#3b82f6"},
    "marketing":    {"label": "Marketing & SEO",     "icon": "📈",  "color": "#ec4899"},
    "presentation": {"label": "Presentations",       "icon": "📊",  "color": "#a78bfa"},
    "3d":           {"label": "3D & Spatial",        "icon": "🧊",  "color": "#14b8a6"},
}


# ── Routes ─────────────────────────────────────────────────────────────────

@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "service": "AI Tool Selector API",
        "version": "1.0.0",
        "tools_loaded": len(TOOLS_DB)
    }


@app.post("/api/search", response_model=SearchResponse)
async def search_tools(request: SearchRequest):
    """
    Main AI search endpoint. Returns ranked tools + comparison in ~1-3s.
    Works without any API key using the local smart engine.
    """
    task = request.task.strip()
    if not task or len(task) < 3:
        raise HTTPException(status_code=400, detail="Task description is too short (min 3 characters).")
    if len(task) > 1000:
        raise HTTPException(status_code=400, detail="Task description too long (max 1000 chars).")

    filters = None
    if request.filters:
        f = {}
        if request.filters.pricing:
            f["pricing"] = request.filters.pricing
        if request.filters.category:
            f["category"] = request.filters.category
        if f:
            filters = f

    # ── Fire web search in background (non-blocking) ───────────────────────
    # search.py already caps itself at 2.5s. We create a task so it runs
    # concurrently with the AI analysis instead of sequentially.
    web_task = asyncio.create_task(search_web_for_tools(task, max_results=6))

    # Give web search a 2.5s head-start window, then proceed regardless
    try:
        web_results = await asyncio.wait_for(asyncio.shield(web_task), timeout=2.5)
    except (asyncio.TimeoutError, Exception):
        web_results = []
        # web_task is still running in background; we'll cancel it after response

    # ── Run AI analysis (local engine ~100ms, Gemini ≤8s with hard cap) ───
    try:
        ai_result = await asyncio.wait_for(
            analyze_and_recommend(task=task, curated_tools=TOOLS_DB, web_results=web_results, filters=filters),
            timeout=12.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Search timed out. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
    finally:
        # Clean up web task if still running
        if not web_task.done():
            web_task.cancel()
            try:
                await web_task
            except (asyncio.CancelledError, Exception):
                pass

    # Build typed response
    tools = [
        ToolResult(
            id=t.get("id", ""),
            name=t.get("name", ""),
            url=t.get("url", ""),
            category=t.get("category", "general"),
            pricing=t.get("pricing", "freemium"),
            description=t.get("description", ""),
            why_it_fits=t.get("why_it_fits", ""),
            score=float(t.get("score", 0.5)),
            source=t.get("source", "curated"),
            tags=t.get("tags", [])
        )
        for t in ai_result.get("tools", [])
        if t.get("name") and t.get("url")  # Filter out empty results
    ]

    comparison = None
    c = ai_result.get("comparison")
    if c and c.get("tool_names") and len(c["tool_names"]) >= 2:
        try:
            comparison = ComparisonTable(
                tool_names=c["tool_names"],
                tool_urls=c.get("tool_urls", []),
                rows=[ComparisonRow(**r) for r in c.get("rows", []) if r.get("attribute") and r.get("values")]
            )
        except Exception:
            comparison = None

    return SearchResponse(
        tools=tools,
        comparison=comparison,
        query_summary=ai_result.get("query_summary", f"AI tools for: {task}"),
        total=len(tools)
    )


@app.get("/api/tools")
async def get_all_tools(
    category: Optional[str] = Query(None),
    pricing: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100)
):
    """Browse and filter the curated tools database."""
    results = TOOLS_DB[:]

    if category:
        results = [t for t in results if t["category"] == category.lower()]
    if pricing:
        pricing_list = [p.strip().lower() for p in pricing.split(",")]
        results = [t for t in results if t["pricing"] in pricing_list]
    if q:
        q_lower = q.lower()
        results = [
            t for t in results
            if q_lower in t["name"].lower()
            or q_lower in t["description"].lower()
            or any(q_lower in tag for tag in t.get("tags", []))
        ]

    total = len(results)
    start = (page - 1) * limit
    paginated = results[start:start + limit]

    return {
        "tools": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, (total + limit - 1) // limit)
    }


@app.get("/api/tools/{tool_id}", response_model=ToolDetailResponse)
async def get_tool_detail(tool_id: str):
    tool = next((t for t in TOOLS_DB if t["id"] == tool_id), None)
    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_id}' not found.")
    return ToolDetailResponse(**tool)


@app.get("/api/categories", response_model=CategoryResponse)
async def get_categories():
    counts = {}
    for tool in TOOLS_DB:
        counts[tool["category"]] = counts.get(tool["category"], 0) + 1

    categories = [
        {
            "id": cat_id,
            "label": meta["label"],
            "icon": meta["icon"],
            "color": meta["color"],
            "count": counts.get(cat_id, 0)
        }
        for cat_id, meta in CATEGORY_META.items()
    ]
    categories.sort(key=lambda x: x["count"], reverse=True)
    return CategoryResponse(categories=categories)


@app.post("/api/compare")
async def compare_tools(request: CompareRequest):
    if len(request.tool_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 tool IDs.")
    if len(request.tool_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 tools at once.")

    result = await generate_comparison(
        tool_ids=request.tool_ids,
        all_tools=TOOLS_DB,
        task=request.task
    )
    return result


@app.get("/api/suggest")
async def suggest_tools(q: Optional[str] = Query(None), limit: int = Query(5, ge=1, le=10)):
    if not q or len(q) < 2:
        return {"suggestions": []}

    q_lower = q.lower()
    matches = [
        {"id": t["id"], "name": t["name"], "category": t["category"], "pricing": t["pricing"]}
        for t in TOOLS_DB
        if q_lower in t["name"].lower() or any(q_lower in tag for tag in t.get("tags", []))
    ][:limit]

    return {"suggestions": matches}
