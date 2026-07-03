import { createContext, useContext } from 'react'

const OptimizeCalcBarContext = createContext(false)

export function OptimizeCalcBarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OptimizeCalcBarContext.Provider value={true}>
      {children}
    </OptimizeCalcBarContext.Provider>
  )
}

export function useOptimizeCalcBar() {
  return useContext(OptimizeCalcBarContext)
}
