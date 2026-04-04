import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const useSIPRecords = (rmId = null, limit = 100, offset = 0) => useQuery({
  queryKey: ['sip-records', rmId, limit, offset],
  queryFn:  () => api.get('/api/sales/sip-records', { params: { rm_id: rmId, limit, offset } }).then(r => r.data),
})

export const useSIPBounce = (month = null, rmName = null) => useQuery({
  queryKey: ['sip-bounce', month, rmName],
  queryFn:  () => api.get('/api/sales/sip-bounce', { params: { month, rm_name: rmName } }).then(r => r.data),
})
