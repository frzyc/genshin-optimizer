import { useDataManagerBase } from '@genshin-optimizer/common/database-ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import type { Calculator } from '@genshin-optimizer/game-opt/engine'
import {
  CompareCalcContext,
  CompareValueDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { GeneratedBuild } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import {
  CharCalcProvider,
  CharStatsDisplay,
  optTargetShortValueLabel,
  useEquippedOptTargetValue,
  useResolvedOptTarget,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { EquipGrid } from '@genshin-optimizer/zzz/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  Button,
  CardContent,
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
import {
  type KeyboardEvent,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CompactBuildEquipGrid } from '../CompactBuildEquipGrid'
import { useOptimizePage } from '../context/OptimizePageContext'
import { OPT_SECTION_IDS } from '../nav/optimizeSections'

/** Shrink-wrap a column so leftover table width stays on the value. */
const shrinkCol = { width: '1%', whiteSpace: 'nowrap' } as const

function useGeneratedBuildList(listId: string) {
  const { database } = useDatabaseContext()
  return useDataManagerBase(database.generatedBuildList, listId)
}

const GeneratedBuildsDisplay = memo(function GeneratedBuildsDisplay() {
  const { t } = useTranslation('page_optimize')
  const { optConfig } = useContext(OptConfigContext)
  const generatedBuildList = useGeneratedBuildList(
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
            <TableCell sx={shrinkCol}>{t('buildsColRank')}</TableCell>
            <TableCell sx={shrinkCol}>{valueLabel}</TableCell>
            <TableCell sx={shrinkCol}>{t('buildsColDelta')}</TableCell>
            <TableCell sx={shrinkCol}>{t('buildsColGear')}</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {builds.map((build, i) => (
            <BuildTableRow
              key={`${i}-${build.wengineId}-${Object.values(build.discIds).join('-')}`}
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
          key={`m-${i}-${build.wengineId}-${Object.values(build.discIds).join('-')}`}
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
  build: GeneratedBuild
  index: number
  baseValue: number | undefined
  valueLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded((v) => !v), [])
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target !== e.currentTarget) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
    },
    [toggle]
  )
  return (
    <>
      <TableRow
        hover
        onClick={toggle}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        sx={{
          cursor: 'pointer',
          '& > *': { borderBottom: expanded ? 0 : undefined },
        }}
      >
        <TableCell sx={shrinkCol}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {expanded ? (
              <ExpandLessIcon fontSize="small" aria-hidden />
            ) : (
              <ExpandMoreIcon fontSize="small" aria-hidden />
            )}
            <span>{index + 1}</span>
          </Stack>
        </TableCell>
        <TableCell sx={shrinkCol}>
          <BuildValueCompare
            value={build.value}
            baseValue={baseValue}
            label={valueLabel}
          />
        </TableCell>
        <TableCell sx={shrinkCol}>
          <DeltaPercent value={build.value} baseValue={baseValue} />
        </TableCell>
        <TableCell sx={shrinkCol}>
          <CompactBuildEquipGrid
            wengineId={build.wengineId}
            discIds={build.discIds}
          />
        </TableCell>
        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
          <EquipBtn build={build} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={5}
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
  build: { discIds, wengineId },
}: {
  build: GeneratedBuild
}) {
  const { t } = useTranslation('build')
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext() ?? {}
  const onEquip = useCallback(() => {
    if (!characterKey) return
    Object.entries(discIds).forEach(
      ([_slotKey, discId]) =>
        discId && database.discs.set(discId, { location: characterKey })
    )
    wengineId && database.wengines.set(wengineId, { location: characterKey })
  }, [characterKey, discIds, wengineId, database.wengines, database.discs])
  return (
    <Button
      color="info"
      size="small"
      startIcon={<CheckroomIcon />}
      onClick={onEquip}
      sx={{ whiteSpace: 'nowrap' }}
    >
      {t('buildDisplay.equipToCrr')}
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
    <Typography
      component="span"
      color={pct >= 0 ? 'success.main' : 'error.main'}
    >
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
  build: GeneratedBuild
  index: number
  baseValue: number | undefined
  valueLabel: string
  sx?: object
}) {
  const { t } = useTranslation('page_optimize')
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), [])
  return (
    <CardThemed sx={sx}>
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
              {t('buildN', { n: index + 1 })}:{' '}
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
        <Box sx={{ pt: 1 }}>
          <CompactBuildEquipGrid
            wengineId={build.wengineId}
            discIds={build.discIds}
          />
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

function BuildDetail({ build }: { build: GeneratedBuild }) {
  const character = useCharacterContext()!
  const team = useTeam(character.key)!
  const baseCalc = useZzzCalcContext()
  return (
    <CharCalcProvider
      character={character}
      team={team}
      discIds={build.discIds}
      wengineId={build.wengineId}
    >
      <CompareCalcContext.Provider value={baseCalc as Calculator}>
        <Box>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <CharStatsDisplay />
            </Grid>
            <Grid size={{ xs: 12, md: 8, lg: 9 }}>
              <EquipGrid discIds={build.discIds} wengineId={build.wengineId} />
            </Grid>
          </Grid>
        </Box>
      </CompareCalcContext.Provider>
    </CharCalcProvider>
  )
}
