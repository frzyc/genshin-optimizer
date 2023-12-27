import { DBLocalStorage, SandboxStorage } from '@genshin-optimizer/database'
import { DatabaseContext, SroDatabase } from '@genshin-optimizer/sr-db'
import {
  CssBaseline,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import Character from './Character'
import Database from './Database'
import { theme } from './Theme'

export default function App() {
  const dbIndex = parseInt(localStorage.getItem('sro_dbIndex') || '1')
  const [databases, setDatabases] = useState(() => {
    localStorage.removeItem('SRONewTabDetection')
    localStorage.setItem('SRONewTabDetection', 'debug')
    return ([1, 2, 3, 4] as const).map((index) => {
      if (index === dbIndex) {
        return new SroDatabase(index, new DBLocalStorage(localStorage))
      } else {
        const dbName = `sro_extraDatabase_${index}`
        const eDB = localStorage.getItem(dbName)
        const dbObj = eDB ? JSON.parse(eDB) : {}
        const db = new SroDatabase(index, new SandboxStorage(dbObj))
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
  const dbContextObj = useMemo(
    () => ({ databases, setDatabases, database, setDatabase }),
    [databases, setDatabases, database, setDatabase]
  )

  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <DatabaseContext.Provider value={dbContextObj}>
          <CssBaseline />
          <Stack gap={1} pt={1}>
            <Character />
            <Database />
          </Stack>
        </DatabaseContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
