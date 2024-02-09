import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useEffect, useState } from 'react'

export default function useCharMeta(key: CharacterKey) {
  const database = useDatabase()
  const [charMeta, setCharMetaState] = useState(() =>
    database.charMeta.get(key)
  )
  useEffect(
    () =>
      database.charMeta.follow(key, (k, r, dbMeta) => setCharMetaState(dbMeta)),
    [key, database]
  )
  useEffect(() => setCharMetaState(database.charMeta.get(key)), [database, key])
  return charMeta
}
