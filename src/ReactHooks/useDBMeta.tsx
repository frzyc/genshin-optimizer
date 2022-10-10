import { useContext, useEffect, useState } from "react"
import { DatabaseContext } from "../Database/Database"

export default function useDBMeta() {
  const { database } = useContext(DatabaseContext)
  const [dbMeta, setDBMeta] = useState(database.dbMeta.get())
  useEffect(() => database.dbMeta.follow((r, dbMeta) => setDBMeta(dbMeta)), [database])
  // Need to update the dbMeta when database changes
  useEffect(() => setDBMeta(database.dbMeta.get()), [database])
  return dbMeta
}
