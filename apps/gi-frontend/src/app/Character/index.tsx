import type { CharacterKey } from '@genshin-optimizer/consts'
import { allCharacterKeys } from '@genshin-optimizer/consts'
import CharacterCard from '../Components/Character/CharacterCard'
import { useCallback, useContext, useState } from 'react'
import type { SelectChangeEvent } from '@mui/material'
import { MenuItem, Select } from '@mui/material'
import { DatabaseContext } from '../Database/Database'

export default function Character() {
  const [characterKey, setCharacterKey] = useState<CharacterKey | ''>('')
  const { database } = useContext(DatabaseContext)
  const onSelectChange = useCallback(
    (event: SelectChangeEvent) => {
      if (characterKey !== '' && !database.chars.get(characterKey))
        database.chars.getWithInitWeapon(characterKey)
      setCharacterKey(event.target.value as CharacterKey)
    },
    [characterKey, database.chars]
  )
  return (
    <>
      <Select value={characterKey} onChange={onSelectChange}>
        {allCharacterKeys.map((charKey) => (
          <MenuItem value={charKey} key={charKey}>
            {charKey}
          </MenuItem>
        ))}
      </Select>
      {characterKey !== '' && <CharacterCard characterKey={characterKey} />}
    </>
  )
}
