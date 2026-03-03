import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '../ui/Toast'
import { ChatbotWidget } from '../chatbot/ChatbotWidget'
import { useUIStore } from '@/store/uiStore'

export function DashboardLayout({ children }) {
  const { toast, hideToast } = useUIStore()

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-sage-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <ChatbotWidget />
      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  )
}
