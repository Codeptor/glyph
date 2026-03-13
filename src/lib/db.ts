import type { GalleryAsset, Preset } from '@/types'

const DB_NAME = 'asc11'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('gallery')) {
        db.createObjectStore('gallery', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('presets')) {
        db.createObjectStore('presets', { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadGallery(): Promise<GalleryAsset[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('gallery', 'readonly')
    const store = tx.objectStore('gallery')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveGalleryItem(asset: GalleryAsset): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('gallery', 'readwrite')
    const store = tx.objectStore('gallery')
    const req = store.put(asset)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('gallery', 'readwrite')
    const store = tx.objectStore('gallery')
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function loadPresets(): Promise<Preset[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('presets', 'readonly')
    const store = tx.objectStore('presets')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePresetItem(preset: Preset): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('presets', 'readwrite')
    const store = tx.objectStore('presets')
    const req = store.put(preset)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function deletePresetItem(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('presets', 'readwrite')
    const store = tx.objectStore('presets')
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
