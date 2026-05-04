from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class SearchFilters(BaseModel):
    pricing: Optional[List[str]] = None   # ["free", "freemium", "paid"]
    category: Optional[str] = None


class SearchRequest(BaseModel):
    task: str
    filters: Optional[SearchFilters] = None


class ToolResult(BaseModel):
    id: str
    name: str
    url: str
    category: str
    pricing: str
    description: str
    why_it_fits: str
    score: float
    source: str  # "curated" or "web"
    tags: List[str]


class ComparisonRow(BaseModel):
    attribute: str
    values: List[str]


class ComparisonTable(BaseModel):
    tool_names: List[str]
    tool_urls: List[str]
    rows: List[ComparisonRow]


class SearchResponse(BaseModel):
    tools: List[ToolResult]
    comparison: Optional[ComparisonTable]
    query_summary: str
    total: int


class CategoryResponse(BaseModel):
    categories: List[Dict[str, Any]]


class ToolDetailResponse(BaseModel):
    id: str
    name: str
    url: str
    category: str
    pricing: str
    description: str
    tags: List[str]


class CompareRequest(BaseModel):
    tool_ids: List[str]
    task: Optional[str] = None
