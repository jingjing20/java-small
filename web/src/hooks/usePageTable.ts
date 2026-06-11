import { useCallback, useState } from 'react'
import type { PageQuery, PageResult } from '@/api/types'

export const DEFAULT_PAGE_SIZE = 10

export function usePageTable<T, Q extends PageQuery>(
  fetcher: (query: Q) => Promise<PageResult<T>>,
  initialQuery: Q,
) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<Q>(initialQuery)

  const fetchData = useCallback(async (q: Q = query) => {
    setLoading(true)
    try {
      const res = await fetcher(q)
      setData(res.records)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [fetcher, query])

  return { data, total, loading, query, setQuery, fetchData }
}
