import { useEffect, type ReactNode } from 'react'
import { IsAdBlockedContext } from '../context'
import { useIsAdblocked } from '../hooks/useIsAdblocked'

export function AdBlockContextWrapper({ children }: { children: ReactNode }) {
  const isAdBlocked = useIsAdblocked()

  useEffect(() => {
    // observe changes on the <body> and reset them. This prevents padding from being added below the footer for intent ads.
    const observer = new MutationObserver(() =>
      document.body.removeAttribute('style')
    )
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <IsAdBlockedContext.Provider value={isAdBlocked}>
      {children}
    </IsAdBlockedContext.Provider>
  )
}
