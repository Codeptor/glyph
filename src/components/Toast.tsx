/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface ToastMessage {
  id: string
  text: string
  type: 'info' | 'error'
}

interface ToastContextType {
  show: (text: string, type?: 'info' | 'error') => void
}

const ToastContext = createContext<ToastContextType>({ show: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [visible, setVisible] = useState(false)

  const show = useCallback((text: string, type: 'info' | 'error' = 'info') => {
    const id = crypto.randomUUID()
    setToast({ id, text, type })
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setToast(null), 300)
    }, 2500)
    return () => clearTimeout(timer)
  }, [visible, toast?.id])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[var(--z-toast)] rounded-md border px-4 py-2 text-xs font-mono uppercase tracking-wider shadow-lg transition-all duration-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } ${
            toast.type === 'error'
              ? 'border-destructive bg-destructive/20 text-destructive'
              : 'border-border bg-background text-foreground'
          }`}
        >
          {toast.text}
        </div>
      )}
    </ToastContext.Provider>
  )
}
