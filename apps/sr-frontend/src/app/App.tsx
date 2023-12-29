import { DBLocalStorage, SandboxStorage } from '@genshin-optimizer/database'
import type { CharacterKey } from '@genshin-optimizer/sr-consts'
import type {
  CharacterContextObj,
  DatabaseContextObj,
} from '@genshin-optimizer/sr-context'
import {
  CharacterContext,
  DatabaseContext,
} from '@genshin-optimizer/sr-context'
import { SroDatabase } from '@genshin-optimizer/sr-db'
import {
  CssBaseline,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
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

  const [characterKey, setCharacterKey] = useState<CharacterKey | ''>('')
  const characterContextObj: CharacterContextObj = useMemo(
    () => ({ characterKey, setCharacterKey }),
    [characterKey]
  )

  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <DatabaseContext.Provider value={dbContextObj}>
          <CharacterContext.Provider value={characterContextObj}>
            <CssBaseline />
            <Stack gap={1} pt={1}>
              <Character />
              <Database />
            </Stack>
          </CharacterContext.Provider>
        </DatabaseContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
