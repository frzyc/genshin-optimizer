import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { SroDatabase } from '@genshin-optimizer/sr/db'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import {
  DatabaseContext,
  type DatabaseContextObj,
} from '../Context/DatabaseContext'

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const dbIndex = parseInt(localStorage.getItem('sro_dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('sro_newTabDetection')
    localStorage.setItem('sro_newTabDetection', 'debug')
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
