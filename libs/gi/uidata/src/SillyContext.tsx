import { createContext } from 'react'

// NOTE: SillyContext is only put in here due to its use in UIData.SourceDisplay.

export type SillyContextObj = {
  silly: boolean
  setSilly: (s: boolean) => void
}

export const SillyContext = createContext({
  silly: false,
  setSilly: () => {},
} as SillyContextObj)
