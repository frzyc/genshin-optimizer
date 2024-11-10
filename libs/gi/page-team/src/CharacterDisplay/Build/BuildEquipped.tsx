import { CardThemed } from '@genshin-optimizer/common/ui'
import { type ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import {
  ArtifactCardNano,
  BuildCard,
  WeaponCardNano,
} from '@genshin-optimizer/gi/ui'
import { Grid } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
export function BuildEquipped({ active = false }: { active?: boolean }) {
  const { t } = useTranslation('build')
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
      name: t('buildEqCard.copy.nameReal'),
      artifactIds: equippedArtifacts,
      weaponId: equippedWeapon,
    })
  const weaponTypeKey = getCharStat(characterKey).weaponType
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
      name: t('buildEqCard.copy.nameTc'),
      description: t('buildEqCard.copy.desc'),
    })
  }

  return (
    <BuildCard
      name={t('buildEqCard.name')}
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
  const weaponTypeKey = getCharStat(characterKey).weaponType
  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 2, lg: 3, xl: 3 }}>
      <Grid item xs={1}>
        <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
          <WeaponCardNano weaponId={weaponId} weaponTypeKey={weaponTypeKey} />
        </CardThemed>
      </Grid>
      {Object.entries(artifactIds).map(([slotKey, id]) => (
        <Grid item key={id || slotKey} xs={1}>
          <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
            <ArtifactCardNano artifactId={id} slotKey={slotKey} />
          </CardThemed>
        </Grid>
      ))}
    </Grid>
  )
}
