export interface ToolResult {
  id: string
  name: string
  url: string
  category: string
  pricing: 'free' | 'freemium' | 'paid'
  description: string
  why_it_fits: string
  score: number
  source: 'curated' | 'web'
  tags: string[]
}

export interface ComparisonRow {
  attribute: string
  values: string[]
}

export interface ComparisonTable {
  tool_names: string[]
  tool_urls: string[]
  rows: ComparisonRow[]
}

export interface SearchResponse {
  tools: ToolResult[]
  comparison: ComparisonTable | null
  query_summary: string
  total: number
}

export interface SearchFilters {
  pricing?: string[]
  category?: string
}

export interface Category {
  id: string
  label: string
  icon: string
  color: string
  count: number
}

export interface RecentSearch {
  query: string
  timestamp: number
  resultsCount: number
}

export type PricingTier = 'free' | 'freemium' | 'paid'
