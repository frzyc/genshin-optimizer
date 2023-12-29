import { DBLocalStorage, SandboxStorage } from '@genshin-optimizer/database'
import { SroDatabase } from '@genshin-optimizer/sr-db'
import type { ReactNode } from 'react'
import { createContext, useCallback, useMemo, useState } from 'react'

type DatabaseContextObj = {
  databases: SroDatabase[]
  setDatabase: (index: number, db: SroDatabase) => void
  database: SroDatabase
}
export const DatabaseContext = createContext({} as DatabaseContextObj)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const dbIndex = parseInt(localStorage.getItem('sro_dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('SRONewTabDetection')
    localStorage.setItem('SRONewTabDetection', 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        return new SroDatabase(index, new DBLocalStorage(localStorage, 'sro'))
      } else {
        const dbName = `sro_extraDatabase_${index}`
        const eDB = localStorage.getItem(dbName)
        const dbObj = eDB ? JSON.parse(eDB) : {}
        const db = new SroDatabase(index, new SandboxStorage(dbObj, 'sro'))
        db.toExtraLocalDB()
        return db
      }
    })
  })
  const setDatabase = useCallback(
    (index: number, db: SroDatabase) => {
      const dbs = [...databases]
      dbs[index] = db
      setDatabases(dbs)
    },
    [databases, setDatabases]
  )

  const database = databases[dbIndex - 1]
  const dbContextObj: DatabaseContextObj = useMemo(
    () => ({ databases, setDatabases, database, setDatabase }),
    [databases, setDatabases, database, setDatabase]
  )
  return (
    <DatabaseContext.Provider value={dbContextObj}>
      {children}
    </DatabaseContext.Provider>
  )
}
