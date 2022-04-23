import { Button, CardContent, Grid, Box } from '@mui/material';
import CardDark from '../Components/Card/CardDark';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { DatabaseContext } from '../Database/Database';
import { DataContext, dataContextObj, TeamData } from '../DataContext';
import Assets from '../Assets/Assets';
import {
  Line,
  Area,
  Scatter,
  ComposedChart,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  Cross,
  Dot,
  Polygon
} from 'recharts';
import CardLight from '../Components/Card/CardLight';
import { UpgradeOptResult } from './artifactQuery';
import { allUpgradeValues } from './artifactUpgradeCrawl'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { uiInput as input } from '../Formula';
import { ArtifactCardPico } from '../PageCharacter/CharacterCard';
import { allSlotKeys, SlotKey } from '../Types/consts';
import { ICachedArtifact } from '../Types/artifact';

type Data = {
  upgradeOpt: UpgradeOptResult,
  showTrue?: boolean,
  objMin: number,
  objMax: number,
  ix?: number,
}
type ChartData = {
  x: number,
  est?: number,
  exact?: number,
  expInc?: number
}

function linspace(lower = 0, upper = 1, steps = 50): number[] {
  var arr: number[] = [];
  var step = (upper - lower) / steps;
  for (let i = 0; i < steps; ++i) {
    arr.push(lower + i * step);
  }
  return arr
}

const nbins = 50;
const plotPoints = 500;
export default function UpgradeOptChartCard({ upgradeOpt, objMin, objMax }: Data) {
  const [calcExacts, setCalcExacts] = useState(false);

  const { database } = useContext(DatabaseContext)
  const bla = database._getArt(upgradeOpt.id)
  if (!bla) {
    throw new Error(`artifact ${upgradeOpt.id} not found.`)
  }

  const slot = bla.slotKey;
  const { data } = useContext(DataContext)
  const artifacts = useMemo(() =>
    allSlotKeys.map(k => [k, database._getArt(data.get(input.art[k].id).value ?? "")]),
    [data, database]) as Array<[SlotKey, ICachedArtifact | undefined]>;

  const gauss = (x: number) => upgradeOpt.params[0].appxDist.gmm.reduce((pv, { p, mu, sig2 }) =>
    pv + (sig2 > 0 ? p * Math.exp(-(mu - x) * (mu - x) / sig2 / 2) / Math.sqrt(2 * Math.PI * sig2) : 0), 0)
  const thr = upgradeOpt.params[0].thr;

  const miin = objMin
  const maax = objMax

  // let ymax = Math.max(...upgradeOpt.params[0].appxDist.gmm.map(({ mu }) => gauss(mu)))
  // if (ymax <= 0) ymax = 1 / nbins
  let ymax = 0
  let dataEst: ChartData[] = linspace(miin, maax, plotPoints).map(v => {
    const est = gauss(v)
    ymax = Math.max(ymax, est)
    return { x: v, est: est }
  })
  if (ymax == 0) ymax = 1 / nbins

  // go back and add delta distributions.
  let deltas: { [key: number]: number } = {}
  upgradeOpt.params[0].appxDist.gmm.forEach(({ p, mu, sig2 }) => {
    if (sig2 <= 0) deltas[mu] = (deltas[mu] ?? 0) + p
  })
  Object.entries(deltas).forEach(([mu, p]) => dataEst.push({ x: parseFloat(mu), est: p * nbins / (maax - miin) }))

  dataEst.sort((a, b) => a.x - b.x)
  // const xmin = dataEst[0].x;
  // const xmax = dataEst[dataEst.length - 1].x;
  let xpercent = (thr - miin) / (maax - miin)

  const [trueData, setTrueData] = useState<ChartData[]>([]);
  const [trueP, setTrueP] = useState(-1);
  const [trueD, setTrueD] = useState(-1);

  useEffect(() => {
    if (!calcExacts) return;
    const exactData = allUpgradeValues(upgradeOpt)
    // console.log(exactData, exactData.reduce((pv, cv) => cv.p + pv, 0))
    let true_p = 0
    let true_d = 0

    // const exactMax = exactData.reduce((pv, cv) => Math.max(pv, cv.v), exactData[0].v)
    // const exactMin = exactData.reduce((pv, cv) => Math.min(pv, cv.v), exactData[0].v)
    let bins = new Array(nbins).fill(0)
    let binstep = (maax - miin) / nbins
    let allbins: number[] = []

    exactData.forEach(({ p, v }) => {
      let whichBin = Math.min(Math.trunc((v - miin) / binstep), nbins - 1)
      bins[whichBin] += p
      allbins.push(whichBin)

      if (v > thr) {
        true_p += p
        true_d += p * (v - thr)
      }
    })
    if (true_p > 0) true_d = true_d / true_p


    let dataExact: ChartData[] = bins.map((dens, ix) => ({ x: miin + ix * binstep, exact: dens / binstep }))
    setTrueP(true_p)
    setTrueD(true_d)
    setTrueData(dataExact)
  }, [calcExacts]);

  if (trueData.length == 0) {
    let binstep = (maax - miin) / nbins
    for (let i = 0; i < nbins; i++) {
      trueData.push({ x: miin + i * binstep, exact: 0 })
    }
  }

  const reportP = (trueP >= 0) ? trueP : upgradeOpt.prob
  const reportD = (trueD >= 0) ? trueD : upgradeOpt.upAvg
  let chartData = dataEst.concat(trueData)

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<string, string>) => {
    if (active) {
      return (
        <div className="custom-tooltip">
          <p className="label"></p>
          <p className="desc">prob. upgrade{trueP >= 0 ? '' : ' (est.):'}: {(100 * reportP).toFixed(1)}%</p>
          <p className="desc">average increase{trueD >= 0 ? '' : ' (est.)'}: {(reportD).toFixed(3)}</p>
        </div>
      )
    }

    return null;
  };

  return <CardLight>
    <CardContent>
      <ResponsiveContainer height="99%" aspect={3}>
        {/* <ComposedChart width={600} height={250} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}> */}
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {/* <CartesianGrid strokeDasharray="4 4" /> */}
          {/* <XAxis dataKey="x" type="number" domain={[Math.round(miin), Math.round(maax)]} allowDecimals={false} /> */}
          <XAxis dataKey="x" type="number" domain={['auto', 'auto']} allowDecimals={false} />
          <YAxis type="number" domain={[0, ymax]} tickFormatter={v => parseFloat(v).toFixed(4)} />
          {/* <Tooltip /> */}
          <Legend verticalAlign='top' height={36} />

          <defs>
            <linearGradient id={`splitOpacity${upgradeOpt.id}`} x1="0" y1="0" x2={xpercent} y2="0">
              <stop offset={1} stopColor='orange' stopOpacity={0} />
              <stop offset={0} stopColor='orange' stopOpacity={1} />
            </linearGradient>
          </defs>

          <Line dataKey="dne" stroke='red' name='Current Damage' />
          <Area type="monotone" dataKey="est" stroke="orange" dot={false} fill={`url(#splitOpacity${upgradeOpt.id})`}
            opacity={.5} name='Estimated Distribution' activeDot={false} />
          {calcExacts && <Area type="stepAfter" dataKey="exact" dot={false} opacity={.7} name='Exact Distribution (Histogram)' activeDot={false} />}

          <ReferenceLine x={thr} stroke="red" strokeDasharray="3 3" name="Current Damage" />
          {/* <ReferenceLine x={thr + upgradeOpt.Edmg} stroke="#ffffff" strokeDasharray="3 3" name="Current Damage" /> */}
          {/* <Scatter dataKey="expInc" /> */}
          {/* <ReferenceArea x1={thr} stroke="gray" strokeOpacity={0.05}/> */}
          <ReferenceDot x={thr + reportD} y={(gauss(thr + reportD) || ymax) / 2} shape={<circle radius={1} opacity={.5} />} />
          {/* <ReferenceDot x={thr + reportD} y={(gauss(thr + reportD) || ymax) / 2} shape={<Cross x={100} y={100} width={70} height={150}/>} /> */}

          <Tooltip content={<CustomTooltip />} cursor={false} />
        </ComposedChart>
      </ResponsiveContainer>

      <Grid direction="row" container spacing={0.75} columns={12}>
        {artifacts.map(([sk, art]: [SlotKey, ICachedArtifact | undefined]) => {
          if (sk != slot)
            return <ArtifactCardPico slotKey={sk} artifactObj={art} />
          return <Grid item key={sk} xs={1}><Button style={{ height: "100%", width: '100%' }}
            // return <Button
            onClick={() => setCalcExacts(true)}
            // startIcon={<FontAwesomeIcon icon={faCalculator} />}
            startIcon={<Box
              sx={{
                position: "absolute",
                width: "70%", height: "70%",
                left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.7
              }}
              component="img"
              src={Assets.slot[sk]}
            />} />
          </Grid>
        })}
      </Grid>
      {/* <ArtifactCardPico slotKey="flower" artifactObj={undefined} /> */}

      <br />
      <span>Click above to calculate Exact upgrade distribution</span>
      <br />
      <span>COMING SOON (tm): MinimumStatConstraint</span>
      <br />
      <br />

    </CardContent>
  </CardLight>
}
