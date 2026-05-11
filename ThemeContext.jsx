import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light' } catch(e){ return 'light' }
  })
  const [primary, setPrimary] = useState(() => {
    try { return localStorage.getItem('primary') || '#7a5cff' } catch(e){ return '#7a5cff' }
  })

  useEffect(() => {
    try { localStorage.setItem('theme', theme) } catch(e){}
    if (theme === 'dark') document.documentElement.classList.add('theme-dark')
    else document.documentElement.classList.remove('theme-dark')
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('primary', primary) } catch(e){}
    // update CSS variable for primary color
    const root = document.documentElement
    root.style.setProperty('--primary-1', primary)
  }, [primary])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, primary, setPrimary }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeContext
