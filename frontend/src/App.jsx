import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useAppStore } from './store/useAppStore'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

function ProtectedRoute({ children }) {
  const user = useAppStore(s => s.user)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAppStore.getState().setUser(session?.user ?? null)
      setChecking(false)
    })
  }, [])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen"
           style={{ background: 'var(--bg-primary)' }}>
        <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(141,198,63,0.2)" strokeWidth="3"/>
          <path d="M12 2a10 10 0 0110 10" stroke="#8dc63f" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  return user ? children : <Navigate to="/" replace />
}

function AuthListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAppStore.getState().setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthListener />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
