import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export const useOpsTasks = (filters = {}) => useQuery({
  queryKey: ['ops-tasks', filters],
  queryFn:  () => api.get('/api/ops/client-tasks', { params: filters }).then(r => r.data),
})

export const useOpsSummary = () => useQuery({
  queryKey: ['ops-summary'],
  queryFn:  () => api.get('/api/ops/dashboard-summary').then(r => r.data),
})
