import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { useContext } from 'react'
import { CharacterContext } from '../../../Context/CharacterContext'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'

import { BuildCard } from './BuildCard'

import { type ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { Grid } from '@mui/material'
import ArtifactCardNano from '../../../Components/Artifact/ArtifactCardNano'
import WeaponCardNano from '../../../Components/Weapon/WeaponCardNano'
export function BuildEquipped({ active = false }: { active?: boolean }) {
  const { teamId, teamCharId } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey, equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const onActive = () =>
    database.teams.setLoadoutDatum(teamId, teamCharId, {
      buildType: 'equipped',
    })
  const onDupe = () =>
    database.teamChars.newBuild(teamCharId, {
      name: 'Duplicate of Equipped',
      artifactIds: equippedArtifacts,
      weaponId: equippedWeapon,
    })
  const weaponTypeKey = getCharData(characterKey).weaponType
  const copyToTc = () => {
    const newBuildTcId = database.teamChars.newBuildTcFromBuild(
      teamCharId,
      weaponTypeKey,
      database.weapons.get(equippedWeapon),
      Object.values(equippedArtifacts).map((id) => database.arts.get(id))
    )
    if (!newBuildTcId) return
    // copy over name
    database.buildTcs.set(newBuildTcId, {
      name: `Equipped Build - Copied`,
      description: 'Copied from Equipped Build',
    })
  }

  return (
    <BuildCard
      name={'Equipped Build'}
      active={active}
      onActive={onActive}
      onCopyToTc={copyToTc}
      onDupe={onDupe}
    >
      <BuildEquip weaponId={equippedWeapon} artifactIds={equippedArtifacts} />
    </BuildCard>
  )
}
function BuildEquip({
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
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 2, lg: 3, xl: 3 }}>
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
