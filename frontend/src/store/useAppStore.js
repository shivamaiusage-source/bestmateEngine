import { create } from 'zustand'

export const useAppStore = create((set) => ({
  user:      null,
  activeTab: 'sales',   // 'sales' | 'operations'

  setUser:      (user) => set({ user }),
  setActiveTab: (tab)  => set({ activeTab: tab }),
  clearUser:    ()     => set({ user: null }),
}))
