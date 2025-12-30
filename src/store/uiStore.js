import { create } from 'zustand'

export const useUIStore = create((set) => ({
  theme: 'light',
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  toast: null,

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: newTheme }
    })
  },

  setTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  openModal: (content) => {
    set({ modalOpen: true, modalContent: content })
  },

  closeModal: () => {
    set({ modalOpen: false, modalContent: null })
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => {
      set({ toast: null })
    }, 5000)
  },

  hideToast: () => {
    set({ toast: null })
  },
}))
