import { useContext, useEffect, useState } from "react"
import { DatabaseContext } from "../Database/Database"
import { CharacterKey } from "../Types/consts"

export default function useCharMeta(key: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  const [charMeta, setCharMetaState] = useState(database.charMeta.get(key))
  useEffect(() => database.charMeta.follow(key, (k, r, dbMeta) => setCharMetaState(dbMeta)), [key, database])
  return charMeta
}
