import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { objMap, range } from '@genshin-optimizer/common/util'
import {
  type ArtifactSlotKey,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import { cachedArtifact } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useArtifact,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import {
  ArtifactCard,
  ArtifactCardObj,
  ArtifactCardPico,
  DataContext,
  EquipBuildModal,
} from '@genshin-optimizer/gi/ui'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  ComposedChart,
  Label,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { UpOptCalculatorV2, UpOptInfo } from './upOpt'

type DefineInfo = Extract<UpOptInfo, { type: 'definition' }>

/**
 * Build a synthetic artifact for displaying a define (sanctifying elixir)
 * candidate, which has no backing DB artifact. Only set/slot/main/affixes are
 * meaningful, so it's rendered with `hideSubstatValues`/`hideLocation`.
 */
function defineDisplayArtifact(info: DefineInfo) {
  return cachedArtifact(
    {
      setKey: info.setKey,
      slotKey: info.slotKey,
      level: 0,
      rarity: 5,
      mainStatKey: info.mainStatKey,
      location: '',
      lock: false,
      // `cachedArtifact` requires exactly 4 substats. The affixes get a non-zero
      // value so the card renders them (it filters out value===0); the actual
      // value is hidden via `hideSubstatValues`. The remaining slots are empty.
      substats: [
        ...info.affixes.map((key) => ({ key, value: getSubstatValue(key, 5) })),
        ...range(info.affixes.length, 3).map(() => ({
          key: '' as const,
          value: 0,
        })),
      ],
    },
    `define-${info.setKey}-${info.slotKey}-${info.mainStatKey}-${info.affixes.join('-')}`
  ).artifact
}

type Props = {
  setArtifactIdToEdit: (id: string | undefined) => void
  objMin: number
  objMax: number
  thresholds: number[]
  ix: number
  upOptCalc: UpOptCalculatorV2
}

const nbins = 50

export default function UpgradeOptChartCard(props: Props) {
  const { t } = useTranslation('page_character_optimize')
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const upOptArt = props.upOptCalc.candidates[props.ix]
  if (!upOptArt) return null
  const info = upOptArt.info
  const artifactId = info.type === 'definition' ? undefined : info.artifactId
  const upArt = artifactId ? database.arts.get(artifactId) : undefined
  const currentlyEquippedArtId =
    upArt?.slotKey && data.get(input.art[upArt.slotKey].id).value
  const isEquipped = !!artifactId && artifactId === currentlyEquippedArtId
  return (
    <Box>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={5} md={4} lg={3} xl={3}>
          {info.type === 'definition' ? (
            <ArtifactCardObj
              artifact={defineDisplayArtifact(info)}
              hideLocation
              hideSubstatValues
              buildsBadgeLabel={t('upOptChart.define')}
            />
          ) : (
            <ArtifactCard
              artifactId={artifactId!}
              onEdit={() => props.setArtifactIdToEdit(artifactId)}
              extraButtons={
                <EquipButton newArtId={artifactId!} disabled={isEquipped} />
              }
            />
          )}
        </Grid>
        <Grid item xs={12} sm={7} md={8} lg={9} xl={9}>
          <UpgradeOptChartCardGraph {...props} />
        </Grid>
      </Grid>
    </Box>
  )
}
function EquipButton({
  newArtId,
  disabled,
}: {
  newArtId: string
  disabled: boolean
}) {
  const database = useDatabase()
  const {
    loadoutDatum,
    loadoutDatum: { buildType, buildId },
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const [show, onShow, onHide] = useBoolState()
  const weapon = database.teams.getLoadoutWeapon(loadoutDatum)
  const artifactids = objMap(
    database.teams.getLoadoutArtifacts(loadoutDatum),
    (art) => art?.id
  )
  const newArt = database.arts.get(newArtId)
  if (!newArt) return

  return (
    <>
      <EquipBuildModal
        currentName={
          buildType === 'real' ? database.builds.get(buildId)!.name : 'Equipped'
        }
        currentWeaponId={weapon?.id}
        currentArtifactIds={artifactids}
        newWeaponId={weapon?.id}
        newArtifactIds={objMap(artifactids, (art, slotKey) =>
          slotKey === newArt.slotKey ? newArtId : art
        )}
        show={show}
        onEquip={() => {
          if (buildType === 'equipped')
            database.arts.set(newArtId, {
              location: charKeyToLocCharKey(characterKey),
            })
          else if (buildType === 'real')
            database.builds.set(buildId, (build) => {
              build.artifactIds[newArt.slotKey] = newArtId
            })
        }}
        onHide={onHide}
      />
      <Tooltip title={<Typography>Equip</Typography>} placement="top" arrow>
        <Box>
          <Button
            color="info"
            size="small"
            onClick={onShow}
            disabled={disabled}
          >
            <CheckroomIcon />
          </Button>
        </Box>
      </Tooltip>
    </>
  )
}

function UpgradeOptChartCardGraph({
  thresholds,
  objMin,
  objMax,
  upOptCalc,
  ix,
}: Props) {
  const { t } = useTranslation('page_character_optimize')
  const { t: tk } = useTranslation('statKey_gen')
  const formatReshapeLabel = useCallback(
    (key: string) =>
      `${tk(key)}${['atk_', 'def_', 'hp_'].includes(key) ? '%' : ''}`,
    [tk]
  )
  const upArt = upOptCalc.candidates[ix]
  const infoArtifactId =
    upArt.info.type === 'definition' ? undefined : upArt.info.artifactId
  const [, forceUpdate] = useForceUpdate()
  const equippedArt = useArtifact(infoArtifactId)

  useEffect(() => {
    if (equippedArt) {
      upOptCalc.reCalc(ix, equippedArt)
      forceUpdate()
    }
  }, [equippedArt, upOptCalc, ix, forceUpdate])

  const constrained = thresholds.length > 1
  const thr0 = thresholds[0]
  const perc = useCallback((x: number) => (100 * (x - thr0)) / thr0, [thr0])
  const [isExactPending, setIsExactPending] = useState(false)
  const dataHist = upOptCalc.histogram(ix, {
    left: objMin,
    right: objMax,
    bins: nbins,
  })

  const ymax = dataHist.reduce((max, { est }) => Math.max(max, est!), 0) || 1
  const xpercent = (thr0 - objMin) / (objMax - objMin)

  // if trueP/E have been calculated, otherwise use upgradeOpt's estimate
  const reportP = upArt.result!.p
  const reportD = upArt.result!.upAvg
  const chartData = dataHist
  const isExact = upArt.evalMode === 'values'

  useEffect(() => {
    if (isExact) return
    setIsExactPending(true)
    let cancelled = false
    upOptCalc
      .calcExactAsync(
        ix,
        {
          left: objMin,
          right: objMax,
          bins: nbins,
        },
        () => cancelled
      )
      .then((updated) => {
        if (cancelled) return
        setIsExactPending(false)
        if (updated) forceUpdate()
      })
    return () => {
      cancelled = true
    }
  }, [upOptCalc, isExact, ix, forceUpdate, objMin, objMax])

  const probUpgradeText = (
    <span>
      {t('upOptChart.prob', { est: isExact ? '' : t('upOptChart.est') })}
      <strong>{(100 * reportP).toFixed(1)}%</strong>
    </span>
  )
  const avgIncText = (
    <span>
      {t('upOptChart.average', { est: isExact ? '' : t('upOptChart.est') })}
      <strong>
        {reportD <= 0 ? '' : '+'}
        {((100 * reportD) / thr0).toFixed(1)}%
      </strong>
    </span>
  )
  const { data } = useContext(DataContext)
  // Define candidates have no backing artifact, so compare against whatever is
  // currently equipped in the candidate's target slot.
  const comparisonSlotKey: ArtifactSlotKey | undefined =
    upArt.info.type === 'definition' ? upArt.info.slotKey : equippedArt?.slotKey
  const currentlyEquippedArtId =
    comparisonSlotKey && data.get(input.art[comparisonSlotKey].id).value
  const isCurrentlyEquipped =
    !!infoArtifactId && currentlyEquippedArtId === infoArtifactId
  const reshapeLabel =
    upArt.info.type === 'reshape'
      ? upArt.info.affixes.map((affix) => formatReshapeLabel(affix)).join(' / ')
      : ''
  const reshapeRolls =
    upArt.info.type === 'reshape' ? upArt.info.mintotal : undefined
  const defineLabel =
    upArt.info.type === 'definition'
      ? upArt.info.affixes.map((affix) => formatReshapeLabel(affix)).join(' / ')
      : ''
  return (
    <CardThemed bgt="light" sx={{ height: '100%', minHeight: 350 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ height: 50, width: 50 }}>
          {!!comparisonSlotKey && (
            <EquippedArtifact slotKey={comparisonSlotKey} />
          )}
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
          }}
        >
          <Box flexGrow={1}>
            {isCurrentlyEquipped ? (
              <SqBadge color="secondary">{t('upOptChart.equipped')}</SqBadge>
            ) : (
              <Typography>{t('upOptChart.current')}</Typography>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {isExactPending && <CircularProgress size={18} />}
            {upArt.info.type === 'reshape' && (
              <>
                <SqBadge color="secondary">{t('upOptChart.reshape')}</SqBadge>
                <Typography variant="body2">
                  {t('upOptChart.reshapeStats', {
                    stats: reshapeLabel,
                    count: reshapeRolls,
                  })}
                </Typography>
              </>
            )}
            {upArt.info.type === 'definition' && (
              <>
                <SqBadge color="secondary">{t('upOptChart.define')}</SqBadge>
                <Typography variant="body2">
                  {t('upOptChart.defineStats', { stats: defineLabel })}
                </Typography>
              </>
            )}
          </Box>

          <Typography>{probUpgradeText}</Typography>
          <Typography>{avgIncText}</Typography>
        </Box>
      </Box>
      <Divider />
      <ResponsiveContainer
        width="100%"
        height="100%"
        maxHeight={300}
        key={upArt.id}
      >
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="x"
            type="number"
            domain={['auto', 'auto']}
            allowDecimals={false}
            tickFormatter={(v) => `${v <= 0 ? '' : '+'}${v}%`}
          >
            <Label
              value={t('upOptChart.incLabel')}
              position="insideBottom"
              style={{ fill: '#eaebed' }}
              offset={-10}
            />
          </XAxis>
          <YAxis
            type="number"
            domain={[0, ymax]}
            tickFormatter={(v) => `${(v * 100).toFixed()}%`}
          >
            <Label
              value={t('upOptChart.probLabel')}
              position="insideLeft"
              angle={-90}
              style={{ fill: '#eaebed' }}
            />
          </YAxis>
          <Legend verticalAlign="top" height={36} />

          <defs>
            <linearGradient
              id={`splitOpacity${upArt.id}`}
              x1="0"
              y1="0"
              x2={xpercent}
              y2="0"
            >
              <stop
                offset={1}
                stopColor={isExact ? '#f17704' : 'orange'}
                stopOpacity={0}
              />
              <stop
                offset={0}
                stopColor={isExact ? '#f17704' : 'orange'}
                stopOpacity={1}
              />
            </linearGradient>
          </defs>

          <Line dataKey="dne" stroke="red" name={t('upOptChart.currentLine')} />
          <Line
            dataKey="dne"
            stroke="rgba(0,200,0)"
            name={t('upOptChart.averageLine')}
          />
          {constrained && (
            <Area
              type="monotone"
              dataKey="est"
              stroke="grey"
              dot={false}
              fill="grey"
              legendType="none"
              tooltipType="none"
              opacity={0.5}
              activeDot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="estCons"
            stroke={isExact ? '#f17704' : 'orange'}
            dot={false}
            fill={`url(#splitOpacity${upArt.id})`}
            opacity={0.5}
            name={
              isExact
                ? t('upOptChart.exactDist', {
                    const: constrained ? t('upOptChart.const') : '',
                  })
                : t('upOptChart.estimatedDist')
            }
            activeDot={false}
          />
          <ReferenceLine
            x={perc(thr0)}
            stroke="red"
            strokeDasharray="3 3"
            name={t('upOptChart.currentTarget')}
          />
          <ReferenceLine
            x={perc(thr0 + reportD)}
            stroke="rgba(0,200,0,1)"
            strokeDasharray="3 3"
            name={t('upOptChart.currentTarget')}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </CardThemed>
  )
}

function EquippedArtifact({ slotKey }: { slotKey: ArtifactSlotKey }) {
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const artifact = useMemo(
    () => database.arts.get(data.get(input.art[slotKey].id).value),
    [slotKey, data, database]
  )
  return <ArtifactCardPico slotKey={slotKey} artifactObj={artifact} />
}
