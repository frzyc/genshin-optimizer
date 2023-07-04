import type { ArtifactSlotKey } from '@genshin-optimizer/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import { imgAssets } from '@genshin-optimizer/gi-assets'
import { linspace } from '@genshin-optimizer/util'
import { Box, Button, CardContent, Grid } from '@mui/material'
import { useCallback, useContext, useMemo, useState } from 'react'
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
import { DatabaseContext } from '../../../../Database/Database'
import { uiInput as input } from '../../../../Formula'
import type { ICachedArtifact } from '../../../../Types/artifact'
import { erf } from './mathUtil'
import { ResultType } from './upOpt'
import type { UpOptArtifact } from './upOpt'

type Data = {
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
  est?: number
  estCons?: number
  exact?: number
  exactCons?: number
  expInc?: number
}

const nbins = 50
export default function UpgradeOptChartCard({
  upgradeOpt,
  thresholds,
  objMin,
  objMax,
  calcExactCallback,
}: Data) {
  const [calcExacts, setCalcExacts] = useState(false)

  const { database } = useContext(DatabaseContext)
  const bla = database.arts.get(upgradeOpt.id)
  if (!bla) {
    throw new Error(`artifact ${upgradeOpt.id} not found.`)
  }

  const constrained = thresholds.length > 1

  const slot = bla.slotKey
  const { data } = useContext(DataContext)
  const artifacts = useMemo(
    () =>
      allArtifactSlotKeys.map((k) => {
        return [k, database.arts.get(data.get(input.art[k].id).value)]
      }),
    [data, database]
  ) as Array<[ArtifactSlotKey, ICachedArtifact | undefined]>

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
      if (sig < 1e-3) return a <= mu && mu < b ? phi + pv : pv
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

  const CustomTooltip = ({ active }: TooltipProps<string, string>) => {
    if (!active) return null
    // I kinda want the [average increase] to only appear when hovering the white dot.
    return (
      <div className="custom-tooltip">
        <p className="label"></p>
        <p className="desc">
          prob. upgrade{isExact ? '' : ' (est.)'}: {(100 * reportP).toFixed(1)}%
        </p>
        <p className="desc">
          average increase{isExact ? '' : ' (est.)'}: {reportD <= 0 ? '' : '+'}
          {((100 * reportD) / thr0).toFixed(1)}%
        </p>
      </div>
    )
  }

  return (
    <CardLight>
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
                <stop offset={1} stopColor="orange" stopOpacity={0} />
                <stop offset={0} stopColor="orange" stopOpacity={1} />
              </linearGradient>
            </defs>

            <Line dataKey="dne" stroke="red" name="Current Damage" />
            {constrained && !calcExacts && (
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
            {constrained && calcExacts && (
              <Area
                type="stepAfter"
                dataKey="exact"
                dot={false}
                legendType="none"
                tooltipType="none"
                opacity={0.7}
                activeDot={false}
                fill="grey"
                stroke="grey"
              />
            )}
            <Area
              type="monotone"
              dataKey="estCons"
              stroke="orange"
              dot={false}
              fill={`url(#splitOpacity${upgradeOpt.id})`}
              opacity={0.5}
              name={`Estimated Distribution`}
              activeDot={false}
            />
            {calcExacts && (
              <Area
                type="stepAfter"
                dataKey="exactCons"
                dot={false}
                opacity={0.7}
                name={`Exact${
                  constrained ? ' Constrained' : ''
                } Distribution (Histogram)`}
                activeDot={false}
              />
            )}

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

        <Grid direction="row" container spacing={0.75} columns={12}>
          {artifacts.map(
            ([sk, art]: [ArtifactSlotKey, ICachedArtifact | undefined]) => {
              if (sk !== slot)
                return (
                  <Grid item key={`${sk}_${upgradeOpt.id}`} xs={1}>
                    <ArtifactCardPico slotKey={sk} artifactObj={art} />
                  </Grid>
                )
              return (
                <Grid item key={`${sk}_${upgradeOpt.id}`} xs={1}>
                  <Button
                    variant="contained"
                    style={{ height: '100%', width: '100%' }}
                    onClick={() => {
                      calcExactCallback()
                      setCalcExacts(true)
                    }}
                    startIcon={
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '70%',
                          height: '70%',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          opacity: 0.7,
                        }}
                        component="img"
                        src={imgAssets.slot[sk]}
                      />
                    }
                    sx={{ minWidth: 0 }}
                  />
                </Grid>
              )
            }
          )}
        </Grid>

        <br />
        <span>Click above to calculate Exact upgrade distribution</span>
        <br />
      </CardContent>
    </CardLight>
  )
}
