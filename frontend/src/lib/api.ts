import axios from 'axios'
import type { SearchResponse, Category, ToolResult, SearchFilters } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s — backend is hard-capped at 12s, this is just a safety net
  headers: { 'Content-Type': 'application/json' },
})

export const searchTools = async (
  task: string,
  filters?: SearchFilters
): Promise<SearchResponse> => {
  const { data } = await api.post<SearchResponse>('/search', { task, filters })
  return data
}

export const getAllTools = async (params?: {
  category?: string
  pricing?: string
  q?: string
  page?: number
  limit?: number
}): Promise<{ tools: ToolResult[]; total: number; page: number; pages: number }> => {
  const { data } = await api.get('/tools', { params })
  return data
}

export const getToolDetail = async (id: string): Promise<ToolResult> => {
  const { data } = await api.get<ToolResult>(`/tools/${id}`)
  return data
}

export const getCategories = async (): Promise<{ categories: Category[] }> => {
  const { data } = await api.get<{ categories: Category[] }>('/categories')
  return data
}

export const compareTools = async (
  tool_ids: string[],
  task?: string
): Promise<any> => {
  const { data } = await api.post('/compare', { tool_ids, task })
  return data
}

export const getSuggestions = async (q: string): Promise<{ suggestions: any[] }> => {
  const { data } = await api.get('/suggest', { params: { q } })
  return data
}
