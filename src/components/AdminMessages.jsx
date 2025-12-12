import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Trash2, RefreshCw, Lock } from 'lucide-react'

const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  // Simple hardcoded password for basic protection
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessages(messages.filter(msg => msg.id !== id))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchMessages()
    } else {
      alert('Incorrect password')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-10 w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 w-full">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <Lock className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-6 text-neutral-900 dark:text-white">Admin Access</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Messages ({messages.length})</h2>
        <button
          onClick={fetchMessages}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-neutral-600 dark:text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <RefreshCw className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center p-10 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
          No messages found.
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">{msg.name}</h3>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">•</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline mb-3 block">
                    {msg.email}
                  </a>
                  <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>
                </div>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminMessages
