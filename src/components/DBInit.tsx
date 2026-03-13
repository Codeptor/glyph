import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

export function DBInit() {
  const initFromDB = useStore((s) => s.initFromDB)
  useEffect(() => {
    initFromDB()
  }, [initFromDB])
  return null
}
