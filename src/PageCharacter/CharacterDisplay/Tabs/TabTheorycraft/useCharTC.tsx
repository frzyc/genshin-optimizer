import { useContext, useEffect, useState } from "react"
import { DatabaseContext } from "../../../../Database/Database"
import { CharacterKey } from "../../../../Types/consts"

export default function useCharTC(characterKey: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  const [charTC, setCharTC] = useState(database.charTCs.get(characterKey))
  useEffect(() => setCharTC(database.charTCs.get(characterKey)), [database, characterKey])
  useEffect(() =>
    characterKey ? database.charTCs.follow(characterKey, (cTC) => cTC && setCharTC(cTC)) : undefined,
    [characterKey, setCharTC, database])
  return charTC
}
