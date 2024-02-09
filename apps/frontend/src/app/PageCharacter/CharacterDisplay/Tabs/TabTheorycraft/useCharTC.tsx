import type { CharacterKey, WeaponKey } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useEffect, useState } from 'react'

export default function useCharTC(
  characterKey: CharacterKey,
  defWeapon: WeaponKey
) {
  const database = useDatabase()
  const [charTC, setCharTC] = useState(() =>
    database.charTCs.getWithInit(characterKey, defWeapon)
  )
  useEffect(() => {
    setCharTC(database.charTCs.getWithInit(characterKey, defWeapon))
    return database.charTCs.follow(
      characterKey,
      (k, r, v) => r === 'update' && setCharTC(v)
    )
  }, [characterKey, setCharTC, database, defWeapon])
  return charTC
}
