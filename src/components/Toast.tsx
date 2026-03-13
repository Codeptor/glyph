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
        <div className={`publish-sonar-toast${visible ? ' is-visible' : ''}${toast.type === 'error' ? ' is-error' : ''}`}>
          <div className="publish-sonar-ping" />
          {toast.text}
        </div>
      )}
    </ToastContext.Provider>
  )
}
