import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import {
  Box,
  Button,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SetEffectDisplay from '../../../../Components/Artifact/SetEffectDisplay'
import CardLight from '../../../../Components/Card/CardLight'
import EquippedGrid from '../../../../Components/Character/EquippedGrid'
import DocumentDisplay from '../../../../Components/DocumentDisplay'
import { CharacterContext } from '../../../../Context/CharacterContext'
import { DataContext } from '../../../../Context/DataContext'
import { TeamCharacterContext } from '../../../../Context/TeamCharacterContext'
import { dataSetEffects } from '../../../../Data/Artifacts'
import { uiInput as input } from '../../../../Formula'

export default function EquipmentSection() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    teamChar: { buildType, buildId },
  } = useContext(TeamCharacterContext)
  const loadoutEquip = buildId && buildType === 'real'
  const { teamData, data } = useContext(DataContext)
  const weaponSheet = teamData[characterKey]?.weaponSheet
  const database = useDatabase()
  const theme = useTheme()
  const breakpoint = useMediaQuery(theme.breakpoints.up('lg'))

  const weaponDoc = useMemo(
    () =>
      weaponSheet &&
      weaponSheet.document.length > 0 && (
        <CardLight>
          <Box p={1}>
            <DocumentDisplay sections={weaponSheet.document} />
          </Box>
        </CardLight>
      ),
    [weaponSheet]
  )

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
      <Grid container spacing={1}>
        {breakpoint && (
          <Grid
            item
            xs={12}
            md={12}
            lg={3}
            xl={3}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {weaponDoc && weaponDoc}
            <ArtifactSectionCard />
          </Grid>
        )}
        <Grid item xs={12} md={12} lg={9} xl={9}>
          <EquippedGrid
            weaponTypeKey={weaponTypeKey}
            weaponId={weaponId}
            artifactIds={artifactIds}
            setWeapon={(id) => {
              if (loadoutEquip) database.builds.set(buildId, { weaponId: id })
              else
                database.weapons.set(id, {
                  location: charKeyToLocCharKey(characterKey),
                })
            }}
            setArtifact={(id) => {
              if (loadoutEquip)
                database.builds.set(buildId, (build) => {
                  const art = database.arts.get(id)
                  if (art?.slotKey) build.artifactIds[art.slotKey] = id
                })
              else
                database.arts.set(id, {
                  location: charKeyToLocCharKey(characterKey),
                })
            }}
          />
        </Grid>
        {!breakpoint && (
          <Grid item xs={12} md={12} xl={3} container spacing={1}>
            {weaponDoc && (
              <Grid item xs={12} md={6} lg={4}>
                {weaponDoc}
              </Grid>
            )}
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <ArtifactSectionCard />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
function ArtifactSectionCard() {
  const { t } = useTranslation(['page_character', 'artifact'])
  const database = useDatabase()
  const {
    character,
    character: { equippedArtifacts },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const hasEquipped = useMemo(
    () => !!Object.values(equippedArtifacts).filter((i) => i).length,
    [equippedArtifacts]
  )
  const unequipArts = useCallback(() => {
    if (!character) return
    if (
      !window.confirm(
        'Do you want to move all currently equipped artifacts to inventory?'
      )
    )
      return
    Object.values(equippedArtifacts).forEach((aid) =>
      database.arts.set(aid, { location: '' })
    )
  }, [character, database, equippedArtifacts])

  const setEffects = useMemo(() => dataSetEffects(data), [data])

  return (
    <CardLight>
      {hasEquipped && (
        <Button
          color="error"
          onClick={unequipArts}
          fullWidth
          sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
        >{t`tabEquip.unequipArts`}</Button>
      )}
      <Box p={1}>
        <Stack spacing={1}>
          {setEffects &&
            Object.entries(setEffects).flatMap(([setKey, setNumKeyArr]) =>
              setNumKeyArr.map((setNumKey) => (
                <SetEffectDisplay
                  key={setKey + setNumKey}
                  setKey={setKey}
                  setNumKey={setNumKey}
                />
              ))
            )}
        </Stack>
      </Box>
    </CardLight>
  )
}
