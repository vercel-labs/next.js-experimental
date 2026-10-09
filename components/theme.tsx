'use client'
import { createContext, useContext, useState } from 'react'

export const THEME_MARKER = 'THEME_PROVIDER_UNIQUE_MARKER_8f21'

const ThemeContext = createContext<{ theme: string; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div data-marker={THEME_MARKER} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
