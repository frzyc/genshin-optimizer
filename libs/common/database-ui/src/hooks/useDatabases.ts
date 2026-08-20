import {
  type Database,
  DBLocalStorage,
  type DBStorage,
  loadJsonOrB64GzipFromStorage,
  SandboxStorage,
  type StorageType,
} from '@genshin-optimizer/common/database'
import { useState } from 'react'

export function useDatabases<DB extends Database>(
  DatabaseClass: new (dbIndex: 1 | 2 | 3 | 4, dbStorage: DBStorage) => DB,
  dbIndex: number,
  newTabKey: string,
  storageType?: StorageType
) {
  return useState(() => {
    localStorage.removeItem(newTabKey)
    localStorage.setItem(newTabKey, 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        const db = new DatabaseClass(
          index,
          new DBLocalStorage(localStorage, storageType)
        )
        db.toExtraLocalDB()
        return db
      } else {
        const dbName = `${storageType ? `${storageType}_` : ''}extraDatabase_${index}`
        const dbObj = loadJsonOrB64GzipFromStorage(dbName)
        const db = new DatabaseClass(
          index,
          new SandboxStorage(dbObj, storageType)
        )
        db.toExtraLocalDB()
        return db
      }
    })
  })
}
