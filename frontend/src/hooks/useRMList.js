import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const useRMList = () => useQuery({
  queryKey: ['rm-list'],
  queryFn:  () => api.get('/api/sales/rm-list').then(r => r.data),
})

export const useMTDMonths = () => useQuery({
  queryKey: ['mtd-months'],
  queryFn:  () => api.get('/api/sales/mtd-months').then(r => r.data),
  staleTime: 10 * 60 * 1000,
  retry: 1,
})

export const useMTDView = (month = null) => useQuery({
  queryKey: ['mtd-view', month],
  queryFn:  () => api.get('/api/sales/mtd-view', { params: month ? { month } : {} }).then(r => r.data),
})
