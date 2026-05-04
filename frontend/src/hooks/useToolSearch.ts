import { useState, useCallback } from 'react'
import { searchTools } from '../lib/api'
import type { SearchResponse, SearchFilters, RecentSearch } from '../types'

const STORAGE_KEY = 'toolsearch_recent'
const MAX_RECENT = 8

function saveRecentSearch(query: string, resultsCount: number) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing: RecentSearch[] = raw ? JSON.parse(raw) : []
    const filtered = existing.filter(s => s.query !== query)
    const updated = [
      { query, timestamp: Date.now(), resultsCount },
      ...filtered,
    ].slice(0, MAX_RECENT)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

export function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY)
}

export function useToolSearch() {
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState('')

  const search = useCallback(async (task: string, filters?: SearchFilters) => {
    if (!task.trim()) return
    setLoading(true)
    setError(null)
    setLastQuery(task)

    try {
      const result = await searchTools(task, filters)
      setData(result)
      saveRecentSearch(task, result.total)
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLastQuery('')
  }, [])

  return { data, loading, error, lastQuery, search, reset }
}
