import { useContext, useEffect, useState } from 'react'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

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
