import { Button, CardContent, Grid, Box } from '@mui/material'
import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react'
import { DatabaseContext } from '../../../../Database/Database'
import { DataContext } from '../../../../Context/DataContext'
import Assets from '../../../../Assets/Assets'
import type { TooltipProps } from 'recharts'
import {
  Line,
  Area,
  ComposedChart,
  Legend,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from 'recharts'
import CardLight from '../../../../Components/Card/CardLight'
import type { QueryResult } from './artifactQuery'
import { allUpgradeValues } from './artifactUpgradeCrawl'
import { uiInput as input } from '../../../../Formula'
import ArtifactCardPico from '../../../../Components/Artifact/ArtifactCardPico'
import type { ArtifactSlotKey } from '@genshin-optimizer/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import type { ICachedArtifact } from '../../../../Types/artifact'
import { gaussPDF } from './mathUtil'

type Data = {
  upgradeOpt: QueryResult
  showTrue?: boolean
  objMin: number
  objMax: number
  ix?: number
}
type ChartData = {
  x: number
  est?: number
  estCons?: number
  exact?: number
  exactCons?: number
  expInc?: number
}

// linspace with non-inclusive endpoint.
function linspace(lower = 0, upper = 1, steps = 50): number[] {
  const arr: number[] = []
  const step = (upper - lower) / steps
  for (let i = 0; i < steps; ++i) {
    arr.push(lower + i * step)
  }
  return arr
}

const nbins = 50
const plotPoints = 500
export default function UpgradeOptChartCard({
  upgradeOpt,
  objMin,
  objMax,
}: Data) {
  const [calcExacts, setCalcExacts] = useState(false)

  const { database } = useContext(DatabaseContext)
  const bla = database.arts.get(upgradeOpt.id)
  if (!bla) {
    throw new Error(`artifact ${upgradeOpt.id} not found.`)
  }

  const constrained = upgradeOpt.thresholds.length > 1

  const slot = bla.slotKey
  const { data } = useContext(DataContext)
  const artifacts = useMemo(
    () =>
      allArtifactSlotKeys.map((k) => [
        k,
        database.arts.get(data.get(input.art[k].id).value ?? ''),
      ]),
    [data, database]
  ) as Array<[ArtifactSlotKey, ICachedArtifact | undefined]>

  const gauss = (x: number) =>
    upgradeOpt.distr.gmm.reduce(
      (pv, { phi, mu, sig2 }) => pv + phi * gaussPDF(x, mu, sig2),
      0
    )
  const gaussConstrained = (x: number) =>
    upgradeOpt.distr.gmm.reduce(
      (pv, { phi, cp, mu, sig2 }) => pv + cp * phi * gaussPDF(x, mu, sig2),
      0
    )
  const thresh = upgradeOpt.thresholds
  const thr0 = thresh[0]
  // const perc = (x: number) => 100 * (x - thr0) / thr0;
  const perc = useCallback((x: number) => (100 * (x - thr0)) / thr0, [thr0])

  const miin = objMin
  const maax = objMax

  let ymax = 0
  const dataEst: ChartData[] = linspace(miin, maax, plotPoints).map((v) => {
    const est = gauss(v)
    ymax = Math.max(ymax, est)
    return { x: perc(v), est: est, estCons: gaussConstrained(v) }
  })
  if (ymax === 0) ymax = nbins / (maax - miin)

  // go back and add delta distributions.
  const deltas: { [key: number]: number } = {}
  const deltasConstrained: { [key: number]: number } = {}
  upgradeOpt.distr.gmm.forEach(({ phi, mu, sig2, cp }) => {
    if (sig2 <= 0) {
      deltas[mu] = (deltas[mu] ?? 0) + phi
      deltasConstrained[mu] = (deltasConstrained[mu] ?? 0) + phi * cp
    }
  })
  Object.entries(deltas).forEach(([mu, p]) =>
    dataEst.push({
      x: perc(parseFloat(mu)),
      est: (p * nbins) / (maax - miin),
      estCons: (deltasConstrained[mu] * nbins) / (maax - miin),
    })
  )

  dataEst.sort((a, b) => a.x - b.x)
  const xpercent = (thr0 - miin) / (maax - miin)

  const [trueData, setTrueData] = useState<ChartData[]>([])
  const [trueP, setTrueP] = useState(-1)
  const [trueE, setTrueE] = useState(-1)

  useEffect(() => {
    // When `calcExacts` is pressed, we may want to sink/swim this artifact to its proper spot.
    // Or not b/c people only really need a fuzzy ordering anyways.
    if (!calcExacts) return
    const exactData = allUpgradeValues(upgradeOpt)
    let true_p = 0
    let true_e = 0

    const bins = new Array(nbins).fill(0)
    const binsConstrained = new Array(nbins).fill(0)
    const binstep = (maax - miin) / nbins

    exactData.forEach(({ p, v }) => {
      const whichBin = Math.min(Math.trunc((v[0] - miin) / binstep), nbins - 1)
      bins[whichBin] += p

      if (v.every((val, ix) => ix === 0 || val > thresh[ix])) {
        binsConstrained[whichBin] += p
        if (v[0] > thr0) {
          true_p += p
          true_e += p * (v[0] - thr0)
        }
      }
    })
    if (true_p > 0) true_e = true_e / true_p

    const dataExact: ChartData[] = bins.map((dens, ix) => ({
      x: perc(miin + ix * binstep),
      exact: dens / binstep,
      exactCons: binsConstrained[ix] / binstep,
    }))
    setTrueP(true_p)
    setTrueE(true_e)
    setTrueData(dataExact)
  }, [calcExacts, maax, miin, thr0, thresh, upgradeOpt, perc])

  if (trueData.length === 0) {
    const binstep = (maax - miin) / nbins
    for (let i = 0; i < nbins; i++) {
      trueData.push({ x: perc(miin + i * binstep), exact: 0, exactCons: 0 })
    }
  }

  // if trueP/E have been calculated, otherwise use upgradeOpt's estimate
  const reportP = trueP >= 0 ? trueP : upgradeOpt.prob
  const reportD = trueE >= 0 ? trueE : upgradeOpt.upAvg
  const chartData = dataEst.concat(trueData)

  // console.log('repd', reportD, upgradeOpt.upAvg)

  const CustomTooltip = ({
    active,
  }: TooltipProps<string, string>) => {
    if (!active) return null
    // I kinda want the [average increase] to only appear when hovering the white dot.
    return (
      <div className="custom-tooltip">
        <p className="label"></p>
        <p className="desc">
          prob. upgrade{trueP >= 0 ? '' : ' (est.)'}:{' '}
          {(100 * reportP).toFixed(1)}%
        </p>
        <p className="desc">
          average increase{trueE >= 0 ? '' : ' (est.)'}:{' '}
          {reportD <= 0 ? '' : '+'}
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
              y={(gaussConstrained(thr0 + reportD) || ymax) / 2}
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
                    onClick={() => setCalcExacts(true)}
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
                        src={Assets.slot[sk]}
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
