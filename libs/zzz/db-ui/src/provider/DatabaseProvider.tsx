import {
  DBLocalStorage,
  SandboxStorage,
} from '@genshin-optimizer/common/database'
import { unzipFromB64Gzip } from '@genshin-optimizer/common/util'
import { ZzzDatabase } from '@genshin-optimizer/zzz/db'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { DatabaseContext, type DatabaseContextObj } from '../context'

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const dbIndex = Number.parseInt(localStorage.getItem('zzz_dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('zzz_newTabDetection')
    localStorage.setItem('zzz_newTabDetection', 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        return new ZzzDatabase(index, new DBLocalStorage(localStorage, 'zzz'))
      } else {
        const dbName = `zzz_extraDatabase_${index}`
        const rawDB = localStorage.getItem(dbName)
        let eDB = ''
        if (rawDB)
          try {
            // Handle if the DB is still an old uncompressed JSON string
            JSON.parse(rawDB)
            eDB = rawDB
          } catch {
            // If JSON parse fails, then it should be a compressed b64 gzip
            eDB = unzipFromB64Gzip(rawDB)
          }
        const dbObj = eDB ? JSON.parse(eDB) : {}
        const db = new ZzzDatabase(index, new SandboxStorage(dbObj, 'zzz'))
        db.toExtraLocalDB()
        return db
      }
    })
  })
  const setDatabase = useCallback(
    (index: number, db: ZzzDatabase) => {
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
