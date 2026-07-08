'use client'
import type { CustomTarget } from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
export type MultiTargetContextObj = {
  customTarget?: CustomTarget
  setCustomTarget: (customTarget: CustomTarget) => void
}

// If using this context without a Provider, then stuff will crash...
// In theory, none of the components that uses this context should work without a provider...
export const MultiTargetContext = createContext({
  customTarget: undefined,
  setCustomTarget: (_ct: CustomTarget) => {},
} as MultiTargetContextObj)
