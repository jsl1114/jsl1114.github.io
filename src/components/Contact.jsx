import { useState } from 'react'
import { motion } from 'framer-motion'
import BottomNav from './ContactDock.jsx'
import { containerVariants, subtitleVariants, titleVariants, dockVariants } from '@/constants/variants.js'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Send } from 'lucide-react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState('') // 'loading', 'success', 'error', ''

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
          }
        ])

      if (error) throw error

      // Send email via prod server
      try {
        await fetch('https://jsl1114-github-io.onrender.com:10000/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
          }),
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Don't block success state if email fails, but log it
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setStatus(''), 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setStatus('error')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2,
      },
    },
  }

  return (
    <motion.div
      className='flex flex-wrap flex-col border-b border-neutral-300 dark:border-neutral-800 pt-10 justify-center items-center w-full'
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.h1
        variants={titleVariants}
        className='text-4xl tracking-tight font-semibold text-center text-neutral-900 dark:text-white mb-2'
      >
        Contact
      </motion.h1>
      <motion.h2
        variants={subtitleVariants}
        className='text-md text-center text-neutral-600 dark:text-neutral-400 mb-8'
      >
        Let's talk!
      </motion.h2>

      <motion.form
        variants={formVariants}
        onSubmit={handleSubmit}
        className='w-full max-w-md px-6 flex flex-col gap-4 mb-10'
      >
        <div className='flex flex-col gap-2'>
          <label htmlFor="name" className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className='w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
            placeholder="Your name"
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor="email" className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className='w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
            placeholder="your@email.com"
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor="message" className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className='w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none'
            placeholder="How can I help you?"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className='mt-2 w-full px-6 py-3 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : status === 'success' ? (
            'Message Sent!'
          ) : status === 'error' ? (
            'Error - Try Again'
          ) : (
            <>
              Send Message
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </motion.form>

      {/* <motion.div
        variants={dockVariants}
        className='w-full px-2 rounded-xl flex flex-col items-center justify-center gap-4 mb-5'
      >
          <BottomNav />
      </motion.div> */}
    </motion.div>
  )
}
export default Contact