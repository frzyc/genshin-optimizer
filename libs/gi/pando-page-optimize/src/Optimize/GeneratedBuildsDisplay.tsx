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
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  CardContent,
  Chip,
  Collapse,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { memo, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizePage } from '../context/OptimizePageContext'
import { BuildEquipGrid } from '../BuildEquipGrid'
import { OPT_SECTION_IDS } from '../nav/optimizeSections'

const GeneratedBuildsDisplay = memo(function GeneratedBuildsDisplay() {
  const { t } = useTranslation('page_optimize')
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
  const builds = useMemo(() => {
    const list = [...(generatedBuildList?.builds ?? [])]
    list.sort((a, b) => b.value - a.value)
    return list
  }, [generatedBuildList?.builds])

  if (!builds.length) return <BuildsEmpty />

  return (
    <Stack spacing={1}>
      <Table size="small" sx={{ display: { xs: 'none', md: 'table' } }}>
        <TableHead>
          <TableRow>
            <TableCell>{t('buildsColRank')}</TableCell>
            <TableCell>{valueLabel}</TableCell>
            <TableCell align="right">{t('buildsColDelta')}</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {builds.map((build, i) => (
            <BuildTableRow
              key={`${i}-${build.weaponId}-${Object.values(build.artIds).join('-')}`}
              build={build}
              index={i}
              baseValue={baseValue}
              valueLabel={valueLabel}
            />
          ))}
        </TableBody>
      </Table>
      {builds.map((build, i) => (
        <GeneratedBuildDisplay
          key={`m-${i}-${build.weaponId}-${Object.values(build.artIds).join('-')}`}
          build={build}
          index={i}
          baseValue={baseValue}
          valueLabel={valueLabel}
          sx={{ display: { xs: 'block', md: 'none' } }}
        />
      ))}
    </Stack>
  )
})
export default GeneratedBuildsDisplay

function BuildsEmpty() {
  const { t } = useTranslation('page_optimize')
  const { scrollToSection } = useOptimizePage()
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('buildsEmptyBody')}
      </Typography>
      <Button
        variant="contained"
        onClick={() => scrollToSection(OPT_SECTION_IDS.opt)}
      >
        {t('buildsEmptyCta')}
      </Button>
    </Box>
  )
}

function BuildTableRow({
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
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded((v) => !v), [])
  return (
    <>
      <TableRow
        hover
        onClick={toggle}
        sx={{ cursor: 'pointer', '& > *': { borderBottom: expanded ? 0 : undefined } }}
      >
        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {expanded ? (
              <ExpandLessIcon fontSize="small" aria-hidden />
            ) : (
              <ExpandMoreIcon fontSize="small" aria-hidden />
            )}
            <span>{index + 1}</span>
            {index === 0 && (
              <Chip size="small" color="success" label={t('buildBest')} />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <BuildValueCompare
            value={build.value}
            baseValue={baseValue}
            label={valueLabel}
          />
        </TableCell>
        <TableCell align="right">
          <DeltaPercent value={build.value} baseValue={baseValue} />
        </TableCell>
        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
          <EquipBtn build={build} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={4}
          sx={{ py: 0, borderBottom: expanded ? undefined : 0 }}
        >
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1 }}>
              <BuildDetail build={build} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

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

function DeltaPercent({
  value,
  baseValue,
}: {
  value: number
  baseValue: number | undefined
}) {
  if (baseValue === undefined || baseValue === 0) return <>—</>
  const pct = ((value - baseValue) / baseValue) * 100
  const sign = pct >= 0 ? '+' : ''
  return (
    <Typography component="span" color={pct >= 0 ? 'success.main' : 'error.main'}>
      {sign}
      {pct.toFixed(1)}%
    </Typography>
  )
}

function GeneratedBuildDisplay({
  build,
  index,
  baseValue,
  valueLabel,
  sx,
}: {
  build: PandoGeneratedBuild
  index: number
  baseValue: number | undefined
  valueLabel: string
  sx?: object
}) {
  const { t } = useTranslation('page_optimize')
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), [])
  return (
    <CardThemed sx={{ ...pandoCardSx, ...sx }}>
      <CardContent sx={{ '&:last-child': { pb: expanded ? 2 : 1 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Box
            role="button"
            tabIndex={0}
            onClick={toggleExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleExpanded()
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flex: 1,
              minWidth: 0,
              cursor: 'pointer',
            }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" aria-hidden />
            ) : (
              <ExpandMoreIcon fontSize="small" aria-hidden />
            )}
            <Typography component="span" sx={{ minWidth: 0 }}>
              {t('buildN', { n: index + 1 })}
              {index === 0 && (
                <Chip
                  size="small"
                  color="success"
                  label={t('buildBest')}
                  sx={{ ml: 0.5 }}
                />
              )}
              :{' '}
              <BuildValueCompare
                value={build.value}
                baseValue={baseValue}
                label={valueLabel}
              />
            </Typography>
            <Box sx={{ ml: 1, flexShrink: 0 }}>
              <DeltaPercent value={build.value} baseValue={baseValue} />
            </Box>
          </Box>
          <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0 }}>
            <EquipBtn build={build} />
          </Box>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pt: 1 }}>
            <BuildDetail build={build} />
          </Box>
        </Collapse>
      </CardContent>
    </CardThemed>
  )
}

function BuildDetail({ build }: { build: PandoGeneratedBuild }) {
  const { character } = useContext(CharacterContext)
  const pandoTeam = useRequiredPandoTeam()
  const baseCalc = useRequiredGiCalcContext()
  const equippedArtifacts = useMemo(
    () => objKeyMap(allArtifactSlotKeys, (slot) => build.artIds[slot]),
    [build.artIds]
  )
  return (
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
  )
}

