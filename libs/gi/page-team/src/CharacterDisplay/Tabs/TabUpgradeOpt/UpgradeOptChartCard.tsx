import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { linspace, objMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSlotKey,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import {
  TeamCharacterContext,
  useArtifact,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import {
  ArtifactCard,
  ArtifactCardPico,
  DataContext,
  EquipBuildModal,
} from '@genshin-optimizer/gi/ui'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import { Box, Button, Divider, Grid, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo } from 'react'
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
import { type UpOptCalculatorV2, integralOfGMM } from './upOptv2'

type Props = {
  setArtifactIdToEdit: (id: string | undefined) => void
  objMin: number
  objMax: number
  thresholds: number[]
  ix: number
  upOptCalc: UpOptCalculatorV2
}
type ChartData = {
  x: number
  est: number
  estCons: number
}

const nbins = 50

export default function UpgradeOptChartCard(props: Props) {
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const upOptArt = props.upOptCalc.candidates[props.ix]
  if (!upOptArt) return null
  const artifactId = upOptArt.info.artifactId
  const upArt = database.arts.get(artifactId)
  const currentlyEquippedArtId =
    upArt?.slotKey && data.get(input.art[upArt.slotKey].id).value
  const isEquipped = artifactId === currentlyEquippedArtId
  return (
    <Box>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={5} md={4} lg={3} xl={3}>
          <ArtifactCard
            artifactId={artifactId}
            onEdit={() => props.setArtifactIdToEdit(artifactId)}
            extraButtons={
              <EquipButton newArtId={artifactId} disabled={isEquipped} />
            }
          />
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
  const [, forceUpdate] = useForceUpdate()
  const equippedArt = useArtifact(upArt.info.artifactId)

  useEffect(() => {
    if (equippedArt) {
      upOptCalc.reCalc(ix, equippedArt)
      forceUpdate()
    }
  }, [equippedArt, upOptCalc, ix, forceUpdate])

  const constrained = thresholds.length > 1

  const thr0 = thresholds[0]
  const perc = useCallback((x: number) => (100 * (x - thr0)) / thr0, [thr0])

  const step = (objMax - objMin) / nbins
  const dataHist: ChartData[] = linspace(objMin, objMax, nbins, false).flatMap(
    (v) => {
      const estimatedIntegral = integralOfGMM(v, v + step, upArt)
      return [
        {
          x: perc(v),
          ...estimatedIntegral,
        },
        {
          x: perc(v + step),
          ...estimatedIntegral,
        },
      ]
    }
  )
  dataHist.unshift({ x: perc(objMin), est: 0, estCons: 0 })
  dataHist.push({ x: perc(objMax), est: 0, estCons: 0 })

  const ymax = dataHist.reduce((max, { est }) => Math.max(max, est!), 0) || 1
  const xpercent = (thr0 - objMin) / (objMax - objMin)

  // if trueP/E have been calculated, otherwise use upgradeOpt's estimate
  const reportP = upArt.result!.p
  const reportD = upArt.result!.upAvg
  const chartData = dataHist
  const isExact = upArt.evalMode === 'values'

  useEffect(() => {
    if (isExact) return
    upOptCalc.calcExact(ix)
    forceUpdate()
  }, [upOptCalc, isExact, ix, forceUpdate])

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
  const currentlyEquippedArtId =
    equippedArt?.slotKey && data.get(input.art[equippedArt.slotKey].id).value
  const isCurrentlyEquipped = currentlyEquippedArtId === upArt.info.artifactId
  const reshapeLabel =
    upArt.info.type === 'reshape'
      ? upArt.info.affixes.map((affix) => formatReshapeLabel(affix)).join(' / ')
      : ''
  const reshapeRolls =
    upArt.info.type === 'reshape' ? upArt.info.mintotal : undefined
  return (
    <CardThemed bgt="light" sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ height: 50, width: 50 }}>
          {!!equippedArt?.slotKey && (
            <EquippedArtifact slotKey={equippedArt.slotKey} />
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
