'use client'
import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'

export default function DatabaseWrapper({ children }: { children: ReactNode }) {
  return (
    // FIXME: this is a ducttape to ensure any RouterLinks in pages won't error.
    <BrowserRouter>
      {typeof window !== 'undefined' ? (
        <DataBaseContext>{children}</DataBaseContext>
      ) : (
        <DatabaseContextSSR>{children}</DatabaseContextSSR>
      )}
    </BrowserRouter>
  )
}
function DataBaseContext({ children }: { children: ReactNode }) {
  const dbIndex = parseInt(localStorage.getItem('dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('GONewTabDetection')
    localStorage.setItem('GONewTabDetection', 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        return new ArtCharDatabase(index, new DBLocalStorage(localStorage))
      } else {
        const dbName = `extraDatabase_${index}`
        const eDB = localStorage.getItem(dbName)
        const dbObj = eDB ? JSON.parse(eDB) : {}
        const db = new ArtCharDatabase(index, new SandboxStorage(dbObj))
        db.toExtraLocalDB()
        return db
      }
    })
  })
  const setDatabase = useCallback(
    (index: number, db: ArtCharDatabase) => {
      const dbs = [...databases]
      dbs[index] = db
      setDatabases(dbs)
    },
    [databases, setDatabases]
  )

  const database = databases[dbIndex - 1]
  const dbContextObj = useMemo(
    () => ({ databases, setDatabases, database, setDatabase }),
    [databases, setDatabases, database, setDatabase]
  )
  return (
    <DatabaseContext.Provider value={dbContextObj}>
      {children}
    </DatabaseContext.Provider>
  )
}
function DatabaseContextSSR({ children }: { children: ReactNode }) {
  // FIXME: this is a ducttape to ensure that there is still a valid DatabaseContext in SSR environment
  const dbContextObj = useMemo(
    () => ({
      databases: [],
      database: new ArtCharDatabase(1, new SandboxStorage({})),
      setDatabase: () => {},
    }),
    []
  )
  return (
    <DatabaseContext.Provider value={dbContextObj}>
      {children}
    </DatabaseContext.Provider>
  )
}
