import { useContext, useEffect, useState } from "react"
import { DatabaseContext } from "../../../../Database/Database"
import { CharacterKey, WeaponKey } from "../../../../Types/consts"

export default function useCharTC(characterKey: CharacterKey, defWeapon: WeaponKey) {
  const { database } = useContext(DatabaseContext)
  const [charTC, setCharTC] = useState(database.charTCs.getWithInit(characterKey, defWeapon))
  useEffect(() => setCharTC(database.charTCs.getWithInit(characterKey, defWeapon)), [database, characterKey, defWeapon])
  useEffect(() =>
    characterKey ? database.charTCs.follow(characterKey, (cTC) => cTC && setCharTC(cTC)) : undefined,
    [characterKey, setCharTC, database])
  return charTC
}
