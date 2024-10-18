'use client'
import { createContext } from 'react'

export type BuildEditContextObj = {
  buildToEdit: string
  //setBuildIdToEdit: (buildId: string) => void
}

export const BuildEditContext = createContext({
  buildToEdit: '',
  //setBuildIdToEdit: () => {},
} as BuildEditContextObj)
