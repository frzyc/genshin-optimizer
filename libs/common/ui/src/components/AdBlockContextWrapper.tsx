import type { ReactNode } from 'react'
import { IsAdBlockedContext } from '../context'
import { useIsAdblocked } from '../hooks/useIsAdblocked'

export function AdBlockContextWrapper({ children }: { children: ReactNode }) {
  const isAdBlocked = useIsAdblocked()
  return (
    <IsAdBlockedContext.Provider value={isAdBlocked}>
      {children}
    </IsAdBlockedContext.Provider>
  )
}
