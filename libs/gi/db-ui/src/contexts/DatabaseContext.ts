import type { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
export type DatabaseContextObj = {
  databases: ArtCharDatabase[]
  setDatabase: (index: number, db: ArtCharDatabase) => void
  database: ArtCharDatabase
}
export const DatabaseContext = createContext({} as DatabaseContextObj)
