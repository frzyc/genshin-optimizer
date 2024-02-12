import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { Box } from '@mui/material'
import { useContext, useMemo } from 'react'
import EquippedGrid from '../../../../Components/Character/EquippedGrid'
import { CharacterContext } from '../../../../Context/CharacterContext'
import { DataContext } from '../../../../Context/DataContext'
import { uiInput as input } from '../../../../Formula'

export default function EquipmentSection() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)

  const database = useDatabase()

  const weaponTypeKey = getCharData(characterKey).weaponType
  const weaponId = data.get(input.weapon.id).value
  const artifactIds = useMemo(
    () =>
      objKeyMap(
        allArtifactSlotKeys,
        (slotKey) => data.get(input.art[slotKey].id).value
      ),
    [data]
  )
  return (
    <Box>
      <EquippedGrid
        weaponTypeKey={weaponTypeKey}
        weaponId={weaponId}
        artifactIds={artifactIds}
        setWeapon={(id) => {
          database.weapons.set(id, {
            location: charKeyToLocCharKey(characterKey),
          })
        }}
        setArtifact={(id) => {
          database.arts.set(id, {
            location: charKeyToLocCharKey(characterKey),
          })
        }}
      />
    </Box>
  )
}
