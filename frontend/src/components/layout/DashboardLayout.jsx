import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ChatbotWidget } from '../chatbot/ChatbotWidget'
import { ToastContainer } from '../ui/Toast'
import { useUIStore } from '@/store/uiStore'

export function DashboardLayout({ children }) {
  const { toast, hideToast } = useUIStore()

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-sage-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <ChatbotWidget />
      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  )
}
