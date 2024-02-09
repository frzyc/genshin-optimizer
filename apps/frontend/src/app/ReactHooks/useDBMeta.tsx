import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useEffect, useState } from 'react'

export default function useDBMeta() {
  const database = useDatabase()
  const [dbMeta, setDBMeta] = useState(database.dbMeta.get())
  useEffect(
    () => database.dbMeta.follow((r, dbMeta) => setDBMeta(dbMeta)),
    [database]
  )
  // Need to update the dbMeta when database changes
  useEffect(() => setDBMeta(database.dbMeta.get()), [database])
  return dbMeta
}
