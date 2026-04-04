import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const useBounceData = (filters = {}) => useQuery({
  queryKey: ['bounce-data', filters],
  queryFn:  () => api.get('/api/sales/sip-bounce', { params: filters }).then(r => r.data),
})
