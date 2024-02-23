import { useTimeout } from '@genshin-optimizer/common/react-util'
import { linspace } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { Box, CardContent, Grid, Typography } from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import type { TooltipProps } from 'recharts'
import {
  Area,
  ComposedChart,
  Label,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ArtifactCardPico from '../../../../Components/Artifact/ArtifactCardPico'
import CardLight from '../../../../Components/Card/CardLight'
import { DataContext } from '../../../../Context/DataContext'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { uiInput as input } from '../../../../Formula'
import ArtifactCard from '../../../../PageArtifact/ArtifactCard'
import { erf } from './mathUtil'
import type { UpOptArtifact } from './upOpt'
import { ResultType } from './upOpt'

type Props = {
  upgradeOpt: UpOptArtifact
  showTrue?: boolean
  objMin: number
  objMax: number
  thresholds: number[]
  ix?: number
  calcExactCallback: () => void
}
type ChartData = {
  x: number
  est: number
  estCons: number
}

const nbins = 50

export default function UpgradeOptChartCard(props: Props) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={5} sm={4} md={4} lg={3} xl={3}>
        <ArtifactCard artifactId={props.upgradeOpt.id} editorProps={{}} />
      </Grid>
      <Grid item xs={7} sm={8} md={8} lg={9} xl={9}>
        <UpgradeOptChartCardGraph {...props} />
      </Grid>
    </Grid>
  )
}

function UpgradeOptChartCardGraph({
  upgradeOpt,
  thresholds,
  objMin,
  objMax,
  calcExactCallback,
}: Props) {
  const database = useDatabase()
  const bla = database.arts.get(upgradeOpt.id)
  if (!bla) {
    throw new Error(`artifact ${upgradeOpt.id} not found.`)
  }

  const constrained = thresholds.length > 1

  // Returns P(a < DMG < b)
  const integral = (a: number, b: number) =>
    upgradeOpt.result!.distr.gmm.reduce((pv, { phi, mu, sig2 }) => {
      const sig = Math.sqrt(sig2)
      if (sig < 1e-3) return a <= mu && mu < b ? phi + pv : pv
      const P = erf((mu - a) / sig) - erf((mu - b) / sig)
      return pv + (phi * P) / 2
    }, 0)
  const integralCons = (a: number, b: number) =>
    upgradeOpt.result!.distr.gmm.reduce((pv, { cp, phi, mu, sig2 }) => {
      const sig = Math.sqrt(sig2)
      if (sig < 1e-3) return a <= mu && mu < b ? cp * phi + pv : pv
      const P = erf((mu - a) / sig) - erf((mu - b) / sig)
      return pv + (cp * phi * P) / 2
    }, 0)
  const thr0 = thresholds[0]
  const perc = useCallback((x: number) => (100 * (x - thr0)) / thr0, [thr0])

  const step = (objMax - objMin) / nbins
  const dataHist: ChartData[] = linspace(objMin, objMax, nbins, false).flatMap(
    (v) => {
      return [
        {
          x: perc(v),
          est: integral(v, v + step),
          estCons: integralCons(v, v + step),
        },
        {
          x: perc(v + step),
          est: integral(v, v + step),
          estCons: integralCons(v, v + step),
        },
      ]
    }
  )
  dataHist.unshift({ x: perc(objMin), est: 0, estCons: 0 })
  dataHist.push({ x: perc(objMax), est: 0, estCons: 0 })

  const ymax = dataHist.reduce((max, { est }) => Math.max(max, est!), 0)
  const xpercent = (thr0 - objMin) / (objMax - objMin)

  // if trueP/E have been calculated, otherwise use upgradeOpt's estimate
  const reportP = upgradeOpt.result!.p
  const reportD = upgradeOpt.result!.upAvg
  const chartData = dataHist
  const isExact = upgradeOpt.result!.evalMode === ResultType.Exact

  const reportBin = linspace(objMin, objMax, nbins, false).reduce((a, b) =>
    b < thr0 + reportD ? b : a
  )
  const reportY = integralCons(reportBin, reportBin + step)
  const timeoutFunc = useTimeout()
  if (!isExact) timeoutFunc(calcExactCallback, 1000) // lazy load the exact calculation

  const probUpgradeText = (
    <span>
      Prob. upgrade{isExact ? '' : ' (est.)'}:{' '}
      <strong>{(100 * reportP).toFixed(1)}%</strong>
    </span>
  )
  const avgIncText = (
    <span>
      Average increase{isExact ? '' : ' (est.)'}:{' '}
      <strong>
        {reportD <= 0 ? '' : '+'}
        {((100 * reportD) / thr0).toFixed(1)}%
      </strong>
    </span>
  )
  const CustomTooltip = ({ active }: TooltipProps<string, string>) => {
    if (!active) return null
    // I kinda want the [average increase] to only appear when hovering the white dot.
    return (
      <div className="custom-tooltip">
        <p className="label"></p>
        <p className="desc">{probUpgradeText}</p>
        <p className="desc">{avgIncText}</p>
      </div>
    )
  }

  return (
    <CardLight>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Typography>{probUpgradeText}</Typography>
            <Typography sx={{ flexGrow: 1 }}>{avgIncText}</Typography>
            <Typography>Currently Equipped</Typography>
          </Box>
        </CardContent>
        <Box sx={{ height: 50, width: 50 }}>
          <EquippedArtifact slotKey={bla.slotKey} />
        </Box>
      </Box>

      <CardContent>
        <ResponsiveContainer width="100%" aspect={2.5} key={upgradeOpt.id}>
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
                value="Relative Damage Potential"
                position="insideBottom"
                style={{ fill: '#eaebed' }}
                offset={-10}
              />
            </XAxis>
            <YAxis type="number" domain={[0, ymax]} tick={false}>
              <Label
                value="Probability"
                position="insideLeft"
                angle={-90}
                style={{ fill: '#eaebed' }}
              />
            </YAxis>
            <Legend verticalAlign="top" height={36} />

            <defs>
              <linearGradient
                id={`splitOpacity${upgradeOpt.id}`}
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

            <Line dataKey="dne" stroke="red" name="Current Damage" />
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
              fill={`url(#splitOpacity${upgradeOpt.id})`}
              opacity={0.5}
              name={
                isExact
                  ? `Exact${constrained ? ' Constrained' : ''} Distribution`
                  : `Estimated Distribution`
              }
              activeDot={false}
            />

            <ReferenceLine
              x={perc(thr0)}
              stroke="red"
              strokeDasharray="3 3"
              name="Current Damage"
            />
            <ReferenceDot
              x={perc(thr0 + reportD)}
              y={reportY / 2}
              shape={<circle radius={1} opacity={0.5} />}
            />

            <Tooltip content={<CustomTooltip />} cursor={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </CardLight>
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
