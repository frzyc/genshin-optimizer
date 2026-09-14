import { CardThemed } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import {
  CompareCalcContext,
  CompareValueDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { PandoGeneratedBuild } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  PandoOptConfigContext,
  useDatabase,
  usePandoGeneratedBuildList,
  useRequiredPandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import {
  CharCalcProvider,
  CharStatsDisplay,
  optTargetShortValueLabel,
  pandoCardSx,
  useEquippedOptTargetValue,
  useRequiredGiCalcContext,
  useResolvedOptTarget,
} from '@genshin-optimizer/gi/formula-ui'
import { ArtifactCardPico, WeaponCardPico } from '@genshin-optimizer/gi/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { memo, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const GeneratedBuildsDisplay = memo(function GeneratedBuildsDisplay() {
  const { optConfig } = useContext(PandoOptConfigContext)
  const generatedBuildList = usePandoGeneratedBuildList(
    optConfig.generatedBuildListId ?? ''
  )
  const baseValue = useEquippedOptTargetValue()
  const { ref } = useResolvedOptTarget()
  const valueLabel = useMemo(
    () => optTargetShortValueLabel(ref?.dim, ref?.name),
    [ref]
  )
  return (
    <Stack spacing={1}>
      {generatedBuildList?.builds.map((build, i) => (
        <GeneratedBuildDisplay
          key={`${i}-${build.weaponId}-${Object.values(build.artIds).join('-')}`}
          build={build}
          index={i}
          baseValue={baseValue}
          valueLabel={valueLabel}
        />
      ))}
    </Stack>
  )
})
export default GeneratedBuildsDisplay

function EquipBtn({
  build: { artIds, weaponId },
}: {
  build: PandoGeneratedBuild
}) {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { character } = useContext(CharacterContext)
  const onEquip = useCallback(() => {
    if (!character) return
    const locKey = charKeyToLocCharKey(character.key)
    Object.values(artIds).forEach(
      (artId) => artId && database.arts.set(artId, { location: locKey })
    )
    weaponId && database.weapons.set(weaponId, { location: locKey })
  }, [character, artIds, weaponId, database.weapons, database.arts])
  return (
    <Button
      color="info"
      size="small"
      startIcon={<CheckroomIcon />}
      onClick={onEquip}
    >
      {t('equipToCrr')}
    </Button>
  )
}

function BuildValueCompare({
  value,
  baseValue,
  label,
}: {
  value: number
  baseValue: number | undefined
  label: string
}) {
  return (
    <>
      {label && `${label} `}
      <CompareValueDisplay
        calcValue={value}
        compareCalcValue={baseValue}
        unit=""
      />
    </>
  )
}

function GeneratedBuildDisplay({
  build,
  index,
  baseValue,
  valueLabel,
}: {
  build: PandoGeneratedBuild
  index: number
  baseValue: number | undefined
  valueLabel: string
}) {
  const { t } = useTranslation('page_optimize')
  const { character } = useContext(CharacterContext)
  const pandoTeam = useRequiredPandoTeam()
  const baseCalc = useRequiredGiCalcContext()
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), [])
  const equippedArtifacts = useMemo(
    () => objKeyMap(allArtifactSlotKeys, (slot) => build.artIds[slot]),
    [build.artIds]
  )
  return (
    <CardThemed sx={pandoCardSx}>
      <CardContent>
        <Stack spacing={1}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                aria-label={expanded ? 'Collapse build' : 'Expand build'}
                onClick={toggleExpanded}
              >
                {expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
              <Typography component="span">
                {t('buildN', { n: index + 1 })}:{' '}
                <BuildValueCompare
                  value={build.value}
                  baseValue={baseValue}
                  label={valueLabel}
                />
              </Typography>
            </Box>
            <EquipBtn build={build} />
          </Box>
          {expanded && (
            <CharCalcProvider
              character={character}
              pandoTeam={pandoTeam}
              equippedWeapon={build.weaponId}
              equippedArtifacts={equippedArtifacts}
            >
              <CompareCalcContext.Provider value={baseCalc as Calculator}>
                <Box>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4} lg={3}>
                      <CharStatsDisplay characterKey={character.key} />
                    </Grid>
                    <Grid item xs={12} md={8} lg={9}>
                      <BuildEquipGrid
                        artIds={build.artIds}
                        weaponId={build.weaponId}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CompareCalcContext.Provider>
            </CharCalcProvider>
          )}
        </Stack>
      </CardContent>
    </CardThemed>
  )
}

function BuildEquipGrid({
  artIds,
  weaponId,
}: {
  artIds: PandoGeneratedBuild['artIds']
  weaponId: string | undefined
}) {
  const database = useDatabase()
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {weaponId && (
        <Box sx={{ width: 64 }}>
          <WeaponCardPico weaponId={weaponId} />
        </Box>
      )}
      {allArtifactSlotKeys.map((slot) => (
        <Box key={slot} sx={{ width: 64 }}>
          <ArtifactCardPico
            slotKey={slot}
            artifactObj={
              artIds[slot] ? database.arts.get(artIds[slot]) : undefined
            }
          />
        </Box>
      ))}
    </Box>
  )
}
