import { type ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { Grid } from '@mui/material'
import { useContext } from 'react'
import ArtifactCardNano from '../../../Components/Artifact/ArtifactCardNano'
import WeaponCardNano from '../../../Components/Weapon/WeaponCardNano'
import { CharacterContext } from '../../../Context/CharacterContext'

export default function BuildEquip({
  weaponId,
  artifactIds,
}: {
  weaponId: string
  artifactIds: Record<ArtifactSlotKey, string>
}) {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const weaponTypeKey = getCharData(characterKey).weaponType
  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
      <Grid item xs={1}>
        <WeaponCardNano weaponId={weaponId} weaponTypeKey={weaponTypeKey} />
      </Grid>
      {Object.entries(artifactIds).map(([slotKey, id]) => (
        <Grid item key={id || slotKey} xs={1}>
          <ArtifactCardNano artifactId={id} slotKey={slotKey} />
        </Grid>
      ))}
    </Grid>
  )
}
