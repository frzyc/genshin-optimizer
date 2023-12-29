import type { SroDatabase } from '@genshin-optimizer/sr-db'
import { createContext } from 'react'

export type DatabaseContextObj = {
  databases: SroDatabase[]
  setDatabase: (index: number, db: SroDatabase) => void
  database: SroDatabase
}
export const DatabaseContext = createContext({} as DatabaseContextObj)
