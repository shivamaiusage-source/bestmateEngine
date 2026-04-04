import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const useRMList = () => useQuery({
  queryKey: ['rm-list'],
  queryFn:  () => api.get('/api/sales/rm-list').then(r => r.data),
})
