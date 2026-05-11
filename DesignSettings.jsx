import React from 'react'
import { useTheme } from '../../context/ThemeContext'

const swatches = ['#7a5cff', '#ff6b6b', '#06b6d4', '#f59e0b', '#ec4899']

const DesignSettings = ({ open, onClose }) => {
  const { theme, setTheme, primary, setPrimary } = useTheme()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative mt-16 mr-4 sm:mr-10 p-4 w-full sm:w-80 card-3d">
        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Design Settings</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Theme</label>
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className={`px-3 py-1 rounded ${theme==='light'?'ring-2 ring-offset-1':''}`}>Light</button>
            <button onClick={() => setTheme('dark')} className={`px-3 py-1 rounded ${theme==='dark'?'ring-2 ring-offset-1':''}`}>Dark</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Primary Color</label>
          <div className="flex gap-2 items-center">
            {swatches.map(s => (
              <button key={s} onClick={() => setPrimary(s)} className="w-8 h-8 rounded" style={{ background: s, boxShadow: primary===s ? '0 0 0 3px rgba(0,0,0,0.12) inset' : 'none' }} />
            ))}
            <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="ml-2" />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800">Close</button>
        </div>
      </div>
    </div>
  )
}

export default DesignSettings
