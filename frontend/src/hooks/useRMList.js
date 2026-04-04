import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const useRMList = () => useQuery({
  queryKey: ['rm-list'],
  queryFn:  () => api.get('/api/sales/rm-list').then(r => r.data),
})

export const useMTDView = (month = null) => useQuery({
  queryKey: ['mtd-view', month],
  queryFn:  () => api.get('/api/sales/mtd-view', { params: month ? { month } : {} }).then(r => r.data),
})
