import { SandboxStorage } from '@genshin-optimizer/database'
import { DatabaseContext, SroDatabase } from '@genshin-optimizer/sr-db'
import { CardThemed, DropdownButton } from '@genshin-optimizer/ui-common'
import { range } from '@genshin-optimizer/util'
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

export default function Database() {
  const {
    database: mainDB,
    databases,
    setDatabase,
  } = useContext(DatabaseContext)
  const [index, setIndex] = useState(0)
  const database = databases[index]
  const current = database === mainDB
  const [data, setData] = useState('')
  // Need to update the dbMeta when database changes
  const [{ lastEdit }, setDBMeta] = useState(database.dbMeta.get())
  useEffect(() => setDBMeta(database.dbMeta.get()), [database])

  const { importedDatabase } =
    useMemo(() => {
      if (!data) return undefined
      let parsed: any
      try {
        parsed = JSON.parse(data)
        console.log(parsed)
        if (typeof parsed !== 'object') {
          return undefined
        }
      } catch (e) {
        return undefined
      }
      // Figure out the file format
      if (parsed.format === 'SROD' || parsed.format === 'SRO') {
        console.log('1')
        // Parse as SROD format
        const copyStorage = new SandboxStorage()
        copyStorage.copyFrom(database.storage)
        const importedDatabase = new SroDatabase(
          (index + 1) as 1 | 2 | 3 | 4,
          copyStorage
        )
        const importResult = importedDatabase.importSROD(parsed, false, false)
        if (!importResult) {
          return undefined
        }

        return { importResult, importedDatabase }
      }
      return undefined
    }, [data, database, index]) ?? {}

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files ?? [''])[0]
    if (typeof file === 'string') return
    const reader = new FileReader()
    reader.onload = () => setData(reader.result as string)
    reader.readAsText(file)
  }

  const replaceDb = useCallback(() => {
    if (!importedDatabase) return
    importedDatabase.swapStorage(database)
    setDatabase(index, importedDatabase)
    importedDatabase.toExtraLocalDB()
  }, [database, importedDatabase, index, setDatabase])

  const swapDb = useCallback(() => {
    if (current) return
    mainDB.toExtraLocalDB()
    database.swapStorage(mainDB)
    setDatabase(index, database)
  }, [current, database, index, mainDB, setDatabase])

  // TODO: Make this reload the component
  const clearDb = useCallback(() => {
    database.clear()
    database.toExtraLocalDB()
  }, [database])

  return (
    <Container>
      <Card>
        <CardThemed bgt="dark">
          <CardContent>
            <Typography variant="h5">Database</Typography>
            <Grid container gap={1}>
              <DropdownButton
                title={`${current ? '* ' : ''}Database ${index + 1}`}
              >
                {range(0, 3).map((i) => (
                  <MenuItem key={i} onClick={() => setIndex(i)}>{`${
                    mainDB === databases[i] ? '* ' : ''
                  }Database ${i + 1}`}</MenuItem>
                ))}
              </DropdownButton>
              <Button onClick={swapDb}>Swap to Database</Button>
              <input
                accept=".json"
                id="icon-button-file"
                type="file"
                onChange={onUpload}
              />
              <Button onClick={replaceDb}>Replace</Button>
              <Button color="warning" onClick={clearDb}>
                Nuke
              </Button>
            </Grid>
            <Typography>Last Edit: {lastEdit}</Typography>
            <Typography component="pre" fontFamily="monospace">
              {JSON.stringify(database.exportSROD(), undefined, 2)}
            </Typography>
          </CardContent>
        </CardThemed>
      </Card>
    </Container>
  )
}
