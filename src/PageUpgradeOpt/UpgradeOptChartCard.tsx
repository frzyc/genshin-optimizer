import { CheckBox, CheckBoxOutlineBlank, Download, Info } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, MenuItem, styled, Typography } from '@mui/material';
import { useContext, useMemo, useState } from 'react';
import { CartesianGrid, ComposedChart, Legend, Bar, Line, Area, LineChart, Tooltip, Scatter, XAxis, YAxis, ZAxis, ReferenceLine, RectangleProps } from 'recharts';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import { UpgradeOptResult } from '../Formula/artifactQuery';
import { allUpgradeValues } from '../Formula/artifactUpgradeCrawl'

type Data = {
  upgradeOpt: UpgradeOptResult,
  showTrue?: boolean,
}
type ChartData = {
  x: number,
  est?: number,
  exact?: number,
}

function linspace(lower = 0, upper = 1, steps = 50): number[] {
  var arr: number[] = [];
  var step = (upper - lower) / steps;
  for (let i = 0; i < steps; ++i) {
    arr.push(lower + i * step);
  }
  return arr
}

const nbins = 20
export default function UpgradeOptChartCard({ upgradeOpt }: Data) {
  const exactData = allUpgradeValues(upgradeOpt)
  const miin = exactData.reduce((prv, cur) => prv < cur.v ? prv : cur.v, exactData[0].v)
  const maax = exactData.reduce((prv, cur) => prv > cur.v ? prv : cur.v, exactData[0].v)

  const mu = upgradeOpt.params[0].mu;
  const std = upgradeOpt.params[0].std;
  const thr = upgradeOpt.params[0].thr;
  const gauss = ((x: number) => Math.exp(-(mu - x) * (mu - x) / std / std / 2) / Math.sqrt(2 * Math.PI) / std);

  let true_p = 0
  let true_d = 0

  let binstep = (maax - miin) / nbins
  let bins = new Array(nbins).fill(0)
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
  const dataEst: ChartData[] = linspace(miin, maax, 100).map(v => {
    return { x: v, est: gauss(v) }
  })
  dataEst.push({ x: thr, est: gauss(thr) })
  dataEst.push({ x: thr + upgradeOpt.Edmg, est: gauss(thr + upgradeOpt.Edmg) })
  dataEst.sort((a, b) => a.x - b.x)

  const xmin = dataEst[0].x;
  const xmax = dataEst[dataEst.length - 1].x;
  let xpercent = (thr - xmin) / (xmax - xmin)

  const data: ChartData[] = dataEst.concat(dataExact)

  // console.log(data)
  // const data = dataEst;
  // return <CardLight>
  //   <CardContent>
  //     <ComposedChart width={600} height={250} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
  //       <XAxis dataKey="x" type="number" domain={['auto', 'auto']} allowDecimals={false} />
  //       <YAxis dataKey="y" type="number" />
  //     </ComposedChart>
  //   </CardContent>
  // </CardLight>

  return <CardLight>
    <CardContent>
      <ComposedChart width={600} height={250} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {/* <CartesianGrid strokeDasharray="4 4" /> */}
        <XAxis dataKey="x" type="number" domain={['auto', 'auto']} allowDecimals={false} />
        <YAxis type="number" domain={['auto', 'auto']} />
        {/* <Tooltip /> */}
        <Legend verticalAlign='top' height={36} />

        <defs>
          <linearGradient id={`splitOpacity${upgradeOpt.id}`} x1="0" y1="0" x2={xpercent} y2="0">
            <stop offset={1} stopColor='orange' stopOpacity={0} />
            <stop offset={0} stopColor='orange' stopOpacity={1} />
          </linearGradient>
        </defs>

        <Area type="stepAfter" dataKey="exact" dot={false} opacity={.4} name='Exact Distribution (Histogram)' />

        <Area type="monotone" dataKey="est" stroke="orange" dot={false} fill={`url(#splitOpacity${upgradeOpt.id})`} opacity={.5} name='Estimated Distribution' />
        <ReferenceLine x={thr} stroke="red" strokeDasharray="3 3" name="Current Damage" />
        <ReferenceLine x={thr + upgradeOpt.Edmg} stroke="#ffffff" strokeDasharray="3 3" name="Current Damage" />


        {/* <Line type="monotone" dataKey="exact"/> */}

        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
      </ComposedChart>

      <span>p = {upgradeOpt.prob}</span>
      <br />
      <span>Expected (avg) dmg increase = {upgradeOpt.Edmg}</span>
      <br />
      <span>COMING SOON (tm): MinimumStatConstraint</span>
      <br />
      <span>Actual p = {true_p}</span>
      <br />
      <span>Actual dmg inc = {true_d}</span>

    </CardContent>
  </CardLight>
}
