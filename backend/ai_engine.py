"""
AI Engine — Smart tool recommendation engine.
Works with two tiers:
  1. Smart local engine (no API key needed) — keyword intent detection + contextual explanations
  2. Google Gemini (if API key provided) — enhanced semantic understanding
"""

import asyncio
import json
import os
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ── Intent → category + keyword mapping ───────────────────────────────────────
INTENT_MAP = {
    "video": {
        "keywords": ["video","clip","shorts","tiktok","youtube","reels","edit","film","movie","footage","recording",
                     "podcast","vlog","animation","subtitle","caption","transcribe","repurpose","trim","cut"],
        "category": "video"
    },
    "image": {
        "keywords": ["image","photo","picture","art","illustration","design","logo","banner","thumbnail","poster",
                     "background","remove","upscale","generate","midjourney","dalle","stable diffusion","sketch"],
        "category": "image"
    },
    "audio": {
        "keywords": ["audio","music","voice","song","sound","podcast","tts","speech","narration","voiceover",
                     "noise","transcribe","record","track","beat","compose","vocals","instrument"],
        "category": "audio"
    },
    "coding": {
        "keywords": ["code","coding","programming","developer","debug","script","app","software","api","backend",
                     "frontend","function","github","git","python","javascript","typescript","sql","database",
                     "deploy","build","test","bug","autocomplete","ide","editor","terminal","cli"],
        "category": "coding"
    },
    "writing": {
        "keywords": ["write","writing","blog","article","essay","email","copy","content","grammar","edit","draft",
                     "summarize","paraphrase","rewrite","newsletter","book","story","script","caption","translate",
                     "text","document","report","proposal","letter","seo","keyword"],
        "category": "writing"
    },
    "design": {
        "keywords": ["design","ui","ux","figma","wireframe","mockup","prototype","brand","logo","landing page",
                     "website","color","palette","typography","icon","component","layout","interface","visual"],
        "category": "design"
    },
    "productivity": {
        "keywords": ["productivity","task","schedule","calendar","meeting","email","automate","workflow","note",
                     "organize","reminder","habit","focus","time","project","collaborate","team","slack","notion"],
        "category": "productivity"
    },
    "research": {
        "keywords": ["research","paper","academic","study","summarize","document","pdf","search","literature",
                     "science","data","fact","source","citation","analyze","review","knowledge","read"],
        "category": "research"
    },
    "marketing": {
        "keywords": ["marketing","seo","ad","campaign","social media","post","instagram","twitter","facebook",
                     "linkedin","analytics","growth","lead","funnel","landing","conversion","brand","audience"],
        "category": "marketing"
    },
    "business": {
        "keywords": ["business","sales","crm","customer","support","chatbot","startup","revenue","deal","prospect",
                     "outreach","client","invoice","contract","hire","hr","finance","b2b","saas"],
        "category": "business"
    },
    "presentation": {
        "keywords": ["presentation","slide","deck","powerpoint","pitch","keynote","visual","board","report",
                     "chart","graph","infographic","investor","meeting","webinar"],
        "category": "presentation"
    },
    "3d": {
        "keywords": ["3d","model","mesh","texture","game","vr","ar","spatial","blender","unity","render","sculpt"],
        "category": "3d"
    }
}

# ── Contextual explanation templates ──────────────────────────────────────────
EXPLANATION_TEMPLATES = {
    "video": [
        "{name} is purpose-built for video workflows like yours — {article} {desc_short}. It handles the full pipeline from raw footage to shareable clip.",
        "For your video task, {name} is the top pick: {article} {desc_short}. No manual editing expertise required.",
        "{name} directly solves what you described. As {article} {desc_short}, it covers the exact workflow end-to-end.",
    ],
    "image": [
        "{name} excels at image tasks like yours — it's {article} {desc_short}. Results are production-ready in seconds.",
        "For generating and editing images, {name} is the go-to choice: {article} {desc_short}. It matches your task precisely.",
        "{name} is {article} {desc_short}, making it the strongest match for your image workflow.",
    ],
    "audio": [
        "{name} is designed for audio workflows like yours. It's {article} {desc_short} — covering exactly what you need with high-quality output.",
        "Your audio task is a natural fit for {name} — {article} {desc_short}. It handles the full workflow without complex setup.",
        "{name} — {article} {desc_short} — aligns directly with what you described and delivers professional results.",
    ],
    "coding": [
        "{name} is a developer-first tool: {article} {desc_short}. It plugs directly into your workflow and reduces the manual overhead.",
        "For your development task, {name} is ideal — {article} {desc_short}. It cuts the time you'd spend doing this manually.",
        "{name} is exactly what you need: {article} {desc_short}. It accelerates the workflow you described inside your existing environment.",
    ],
    "writing": [
        "{name} is built for writing tasks like yours — {article} {desc_short}. It adapts to your tone and delivers results fast.",
        "Your writing task is a natural fit for {name}: {article} {desc_short}. It handles the heavy lifting so you focus on ideas.",
        "{name} — {article} {desc_short} — is exactly what your task calls for. It covers the workflow from brief to final draft.",
    ],
    "design": [
        "{name} handles design tasks end-to-end: {article} {desc_short}. It's a direct fit for what you described.",
        "For your design workflow, {name} is the right choice — {article} {desc_short}. No manual design skills required.",
        "{name} is {article} {desc_short}, and it outputs production-ready assets matched to your exact use case.",
    ],
    "productivity": [
        "{name} directly addresses your productivity need — {article} {desc_short}. It removes friction from your daily workflow.",
        "To accomplish your task, {name} automates the process. It's {article} {desc_short} that saves you meaningful time.",
        "{name} is a strong match: {article} {desc_short}. It eliminates the repetitive part of what you described.",
    ],
    "research": [
        "{name} is designed for research workflows like yours — {article} {desc_short}. It delivers accurate, cited results in seconds.",
        "Your research task is exactly what {name} handles: {article} {desc_short}. It eliminates manual document hunting.",
        "{name} — {article} {desc_short} — makes your research task dramatically faster and more accurate.",
    ],
    "marketing": [
        "{name} is a marketing powerhouse for tasks like yours: {article} {desc_short}. Built specifically for growth teams.",
        "For your marketing goal, {name} is the top choice — {article} {desc_short} optimized for conversion and reach.",
        "{name} is {article} {desc_short}, handling your exact use case with performance data built in.",
    ],
    "business": [
        "{name} is built for business workflows like yours — {article} {desc_short}. It makes your operation measurably more efficient.",
        "Your business task maps directly to {name}'s strengths: {article} {desc_short} that works at scale.",
        "{name} addresses your need head-on — {article} {desc_short} with enterprise-grade reliability.",
    ],
    "presentation": [
        "{name} makes presentation creation fast: {article} {desc_short}. You get polished slides with minimal manual effort.",
        "For building presentations, {name} is top-tier — {article} {desc_short} that auto-formats everything beautifully.",
        "{name} is {article} {desc_short} that handles exactly what you described and delivers publication-ready output.",
    ],
    "3d": [
        "{name} is built for 3D workflows like yours — {article} {desc_short}. It accelerates your creation pipeline significantly.",
        "Your 3D task is a direct match for {name}: {article} {desc_short} with impressive quality output.",
        "{name} brings AI to your 3D workflow — {article} {desc_short} that works in a fraction of traditional time.",
    ],
    "default": [
        "{name} is highly relevant to your task — {article} {desc_short}. It covers the core of what you need.",
        "For what you described, {name} is a strong option: {article} {desc_short} that works effectively out of the box.",
        "{name} directly addresses your need — {article} {desc_short} that fits your workflow.",
    ]
}


def _shorten_description(desc: str, max_words: int = 10) -> str:
    """
    Convert a tool description into a clean noun phrase for use in templates.
    e.g. "Create professional videos..." → "professional video creation tool"
         "AI repurposing tool that turns..." → "AI-powered repurposing tool"
    """
    d = desc.strip().rstrip(".")

    # Strip common leading imperative verbs and convert to noun phrase
    verb_map = {
        "create": "tool for creating", "build": "tool for building",
        "generate": "generator for", "turn": "tool that converts",
        "convert": "converter for", "edit": "editor for",
        "write": "writing tool for", "record": "recording tool for",
        "design": "design tool for", "manage": "management tool for",
        "automate": "automation tool for", "track": "tracking tool for",
        "analyze": "analysis tool for", "search": "search tool for",
        "find": "discovery tool for", "make": "tool for making",
        "get": "tool for getting", "run": "runtime for",
    }

    first_word = d.split()[0].lower() if d else ""
    if first_word in verb_map:
        rest = " ".join(d.split()[1:])
        d = verb_map[first_word] + " " + rest

    # Truncate at "that" or "with" to keep it tight
    for splitter in [" that ", " which ", " — ", " for use"]:
        if splitter in d:
            d = d.split(splitter)[0]

    # Trim to max_words
    words = d.split()
    if len(words) > max_words:
        d = " ".join(words[:max_words]) + "..."

    return d


def _article(phrase: str) -> str:
    """Return 'an' if phrase starts with a vowel sound, else 'a'."""
    if not phrase:
        return "a"
    # Words that sound like they start with a vowel
    vowel_starts = ('a', 'e', 'i', 'o', 'u', 'ai', 'au')
    lower = phrase.lower()
    if any(lower.startswith(v) for v in vowel_starts):
        return "an"
    return "a"


def _generate_explanation(tool: Dict, category: str, rank: int) -> str:
    """Generate a contextual explanation for why a tool fits the task."""
    templates = EXPLANATION_TEMPLATES.get(category, EXPLANATION_TEMPLATES["default"])
    template = templates[rank % len(templates)]
    desc_short = _shorten_description(tool.get("description", "general-purpose AI tool"))
    art = _article(desc_short)
    return template.format(name=tool["name"], desc_short=desc_short, article=art)


def _detect_intent(task: str) -> List[str]:
    """Detect one or more intents from the task description. Returns ordered list of categories."""
    task_lower = task.lower()
    scores: Dict[str, int] = {}
    for intent, data in INTENT_MAP.items():
        count = sum(1 for kw in data["keywords"] if kw in task_lower)
        if count > 0:
            scores[intent] = count
    # Sort by score descending
    return sorted(scores.keys(), key=lambda k: scores[k], reverse=True)


def _smart_score(tool: Dict, task_words: set, primary_category: str, secondary_categories: List[str]) -> float:
    """Multi-factor relevance scoring."""
    score = 0.0

    # Category match (strongest signal)
    if tool["category"] == primary_category:
        score += 0.5
    elif tool["category"] in secondary_categories:
        score += 0.25

    # Tag overlap
    tag_words = set(tool.get("tags", []))
    tag_overlap = len(task_words & tag_words)
    score += min(tag_overlap * 0.08, 0.3)

    # Description keyword overlap
    desc_words = set(re.findall(r'\w+', tool.get("description", "").lower()))
    desc_overlap = len(task_words & desc_words)
    score += min(desc_overlap * 0.04, 0.2)

    return min(round(score, 3), 1.0)


def _smart_sort_tools(task: str, all_tools: List[Dict], filters: Optional[Dict]) -> List[Dict]:
    """Full intelligent scoring pipeline."""
    task_lower = task.lower()
    task_words = set(re.findall(r'\w+', task_lower))

    intents = _detect_intent(task)
    primary_cat = intents[0] if intents else "writing"
    secondary_cats = intents[1:4]

    scored = []
    for tool in all_tools:
        # Apply filters
        if filters:
            if filters.get("pricing") and tool["pricing"] not in filters["pricing"]:
                continue
            if filters.get("category") and tool["category"] != filters["category"]:
                continue

        s = _smart_score(tool, task_words, primary_cat, secondary_cats)
        scored.append((s, tool))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [(score, t) for score, t in scored]


def _build_comparison_table(tools: List[Dict]) -> Dict:
    """Build rich comparison table from top 3 tools."""
    top3 = tools[:3]
    if len(top3) < 2:
        return None

    pricing_display = {
        "free": "Free",
        "freemium": "Freemium (Free tier)",
        "paid": "Paid / Subscription"
    }

    free_trial = {
        "free": "Yes — always free",
        "freemium": "Yes — free plan available",
        "paid": "Trial may vary"
    }

    ease_map = {
        "writing": "Beginner-friendly", "productivity": "Beginner-friendly",
        "research": "Beginner-friendly", "presentation": "Beginner-friendly",
        "image": "Intermediate", "video": "Intermediate", "audio": "Intermediate",
        "design": "Intermediate", "marketing": "Intermediate",
        "coding": "Developer-focused", "business": "Business user",
        "3d": "Advanced"
    }

    return {
        "tool_names": [t["name"] for t in top3],
        "tool_urls": [t["url"] for t in top3],
        "rows": [
            {
                "attribute": "Pricing",
                "values": [pricing_display.get(t["pricing"], t["pricing"].title()) for t in top3]
            },
            {
                "attribute": "Free Plan",
                "values": [free_trial.get(t["pricing"], "Check website") for t in top3]
            },
            {
                "attribute": "Best For",
                "values": [_shorten_description(t["description"], 8) for t in top3]
            },
            {
                "attribute": "Category",
                "values": [t["category"].replace("-", " ").title() for t in top3]
            },
            {
                "attribute": "Ease of Use",
                "values": [ease_map.get(t["category"], "Intermediate") for t in top3]
            },
            {
                "attribute": "Platform",
                "values": ["Web App" for _ in top3]  # All are web-based in our DB
            },
        ]
    }


async def analyze_and_recommend(
    task: str,
    curated_tools: List[Dict],
    web_results: List[Dict],
    filters: Optional[Dict] = None
) -> Dict[str, Any]:
    """Main recommendation pipeline. Local engine is always instant (<100ms)."""

    # Try Gemini first if key is available — hard 8s cap so we never block
    if GEMINI_API_KEY:
        try:
            result = await asyncio.wait_for(
                _gemini_analyze(task, curated_tools, web_results, filters),
                timeout=8.0
            )
            if result and result.get("tools"):
                return result
        except asyncio.TimeoutError:
            print("[Gemini] Timed out after 8s — using local engine")
        except Exception as e:
            print(f"[Gemini] Error, falling back to local engine: {e}")

    # Smart local engine (always available, instant, works great)
    return _local_analyze(task, curated_tools, web_results, filters)


def _local_analyze(
    task: str,
    curated_tools: List[Dict],
    web_results: List[Dict],
    filters: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    High-quality local recommendation engine.
    No API key needed — uses intent detection + smart scoring + contextual explanations.
    """
    intents = _detect_intent(task)
    primary_cat = intents[0] if intents else "writing"

    scored = _smart_sort_tools(task, curated_tools, filters)

    # Take top results
    top_scored = scored[:10]

    # Add web-sourced tools if they mention real tool names
    web_tools = _extract_web_tools(web_results, curated_tools)

    tools = []
    for rank, (score, t) in enumerate(top_scored):
        explanation = _generate_explanation(t, primary_cat if t["category"] == primary_cat else t["category"], rank)
        tools.append({
            "id": t["id"],
            "name": t["name"],
            "url": t["url"],
            "category": t["category"],
            "pricing": t["pricing"],
            "description": t["description"],
            "why_it_fits": explanation,
            "score": max(score, 0.1),
            "source": "curated",
            "tags": t.get("tags", [])
        })

    # Merge up to 2 unique web-sourced tools
    seen_names = {t["name"].lower() for t in tools}
    for wt in web_tools:
        if wt["name"].lower() not in seen_names and len(tools) < 12:
            tools.append(wt)
            seen_names.add(wt["name"].lower())

    # Build comparison
    comparison = _build_comparison_table([t for t in tools[:3]])

    # Build summary
    intent_labels = {
        "video": "video editing and creation",
        "image": "AI image generation and editing",
        "audio": "audio and music generation",
        "coding": "developer and coding assistance",
        "writing": "AI writing and content creation",
        "design": "design and UI tools",
        "productivity": "productivity and automation",
        "research": "research and document analysis",
        "marketing": "marketing and SEO",
        "business": "business and sales automation",
        "presentation": "presentation creation",
        "3d": "3D modeling and generation"
    }
    domain = intent_labels.get(primary_cat, "AI-powered assistance")
    summary = f"Top {len(tools)} AI tools for {domain} — ranked by relevance to your task"

    return {
        "query_summary": summary,
        "tools": tools,
        "comparison": comparison,
        "total": len(tools)
    }


def _extract_web_tools(web_results: List[Dict], curated_tools: List[Dict]) -> List[Dict]:
    """Extract potential new tools from web search results."""
    curated_names = {t["name"].lower() for t in curated_tools}
    curated_urls = {t["url"] for t in curated_tools}
    extracted = []

    for result in web_results:
        title = result.get("title", "")
        url = result.get("url", "")
        snippet = result.get("snippet", "")

        # Skip non-tool URLs (news, reddit, etc.)
        skip_domains = ["reddit.com", "quora.com", "medium.com", "twitter.com", "youtube.com"]
        if any(d in url for d in skip_domains):
            continue
        if url in curated_urls:
            continue
        if not title or len(title) < 4:
            continue

        # Check if title looks like a tool name (not a generic article)
        if any(word in title.lower() for word in ["best", "top", "how to", "guide", "review"]):
            continue

        name_lower = title.lower().split(":")[0].strip()
        if name_lower in curated_names:
            continue

        # Looks like a real tool
        if url.startswith("http") and len(title) < 60:
            extracted.append({
                "id": f"web-{len(extracted)}",
                "name": title[:50],
                "url": url,
                "category": "general",
                "pricing": "freemium",
                "description": snippet[:150] if snippet else "AI tool discovered from live web search.",
                "why_it_fits": f"{title} was found in a live web search for this task type.",
                "score": 0.4,
                "source": "web",
                "tags": []
            })

    return extracted[:2]


async def _gemini_analyze(
    task: str,
    curated_tools: List[Dict],
    web_results: List[Dict],
    filters: Optional[Dict] = None
) -> Optional[Dict[str, Any]]:
    """Gemini-powered enhanced analysis (optional upgrade path)."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)

        # Pre-filter to reduce token usage
        intents = _detect_intent(task)
        primary_cat = intents[0] if intents else None

        scored = _smart_sort_tools(task, curated_tools, filters)
        top_tools = [t for _, t in scored[:30]]

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.35,
                "top_p": 0.9,
                "max_output_tokens": 3000,
                "response_mime_type": "application/json",
            }
        )

        prompt = f"""You are an expert AI tool curator. Recommend the best AI tools for this task.

USER TASK: "{task}"

AVAILABLE TOOLS (pre-filtered, top candidates):
{json.dumps(top_tools, indent=2)}

WEB RESULTS (supplemental):
{json.dumps(web_results[:5], indent=2)}

Return JSON:
{{
  "query_summary": "one sentence describing what was searched for",
  "tools": [
    {{
      "id": "tool-id",
      "name": "Tool Name",
      "url": "https://...",
      "category": "category",
      "pricing": "free|freemium|paid",
      "description": "brief description",
      "why_it_fits": "2-3 sentence specific explanation referencing the user's exact task",
      "score": 0.0-1.0,
      "source": "curated",
      "tags": []
    }}
  ],
  "comparison": {{
    "tool_names": ["T1","T2","T3"],
    "tool_urls": ["url1","url2","url3"],
    "rows": [
      {{"attribute": "Pricing", "values": ["...","...","..."]}},
      {{"attribute": "Free Plan", "values": ["...","...","..."]}},
      {{"attribute": "Best For", "values": ["...","...","..."]}},
      {{"attribute": "Ease of Use", "values": ["...","...","..."]}},
      {{"attribute": "Platform", "values": ["...","...","..."]}},
      {{"attribute": "Key Feature", "values": ["...","...","..."]}}
    ]
  }}
}}

Select 6-10 best tools. Write specific why_it_fits for each. Return ONLY valid JSON."""

        # Run the sync Gemini SDK call in a thread pool so it doesn't
        # block the asyncio event loop (critical for preventing timeouts)
        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()

        # Strip markdown code blocks if present
        if text.startswith("```"):
            text = re.sub(r'^```(?:json)?\n?', '', text)
            text = re.sub(r'\n?```$', '', text)

        result = json.loads(text)

        # Enrich with curated data
        curated_map = {t["id"]: t for t in curated_tools}
        for tool in result.get("tools", []):
            tid = tool.get("id", "")
            if tid in curated_map:
                c = curated_map[tid]
                tool.setdefault("tags", c.get("tags", []))
                tool.setdefault("url", c.get("url", ""))
                tool.setdefault("description", c.get("description", ""))
                tool["source"] = "curated"
            else:
                tool.setdefault("source", "web")
                tool.setdefault("tags", [])

        result["total"] = len(result.get("tools", []))
        return result

    except json.JSONDecodeError as e:
        print(f"[Gemini] JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return None


async def generate_comparison(tool_ids: List[str], all_tools: List[Dict], task: Optional[str] = None) -> Dict:
    """Generate detailed comparison for specific tool IDs."""
    tool_map = {t["id"]: t for t in all_tools}
    selected = [tool_map[tid] for tid in tool_ids if tid in tool_map]

    if len(selected) < 2:
        return {"error": "Provide at least 2 valid tool IDs"}

    return _build_comparison_table(selected)
