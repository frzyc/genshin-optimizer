'use client'
import { createContext } from 'react'

export type SillyContextObj = {
  silly: boolean
  setSilly: (s: boolean) => void
}

export const SillyContext = createContext({
  silly: false,
  setSilly: () => {},
} as SillyContextObj)
