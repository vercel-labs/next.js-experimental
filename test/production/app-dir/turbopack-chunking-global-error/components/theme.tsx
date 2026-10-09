'use client'

import { createContext, useContext, type ReactNode } from 'react'

const ThemeContext = createContext('light')

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value="light">{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
