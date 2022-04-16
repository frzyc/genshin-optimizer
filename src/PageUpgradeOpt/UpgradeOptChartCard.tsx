import { CheckBox, CheckBoxOutlineBlank, Download, Info } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, MenuItem, styled, Typography } from '@mui/material';
import { useContext, useMemo, useState } from 'react';
import { CartesianGrid, ComposedChart, Legend, Line, Area, LineChart, Tooltip, Scatter, XAxis, YAxis, ZAxis, ReferenceLine } from 'recharts';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import { UpgradeOptResult } from '../Formula/artifactQuery';

type Data = {
  upgradeOpt: UpgradeOptResult
}

function linspace(lower = 0, upper = 1, steps = 50): number[] {
  var arr: number[] = [];
  var step = (upper - lower) / steps;
  for (let i = 0; i < steps; ++i) {
    arr.push(lower + i * step);
  }
  return arr
}

export default function UpgradeOptChartCard({ upgradeOpt }: Data) {
  const mu = upgradeOpt.params.mu;
  const std = upgradeOpt.params.std;
  const thr = upgradeOpt.params.thr;

  const gauss = ((x: number) => Math.exp(-(mu - x) * (mu - x) / std / std / 2) / Math.sqrt(2 * Math.PI) / std);

  const xs = linspace(mu - 3 * std, mu + 3 * std, 100)
  const data = xs.map(v => {
    return {
      x: v,
      y: gauss(v),
      area: v > thr ? gauss(v) : 0
    }
  })
  data.push({ x: upgradeOpt.params.thr, y: gauss(thr), area: gauss(thr) })
  data.push({ x: upgradeOpt.params.thr, y: gauss(thr), area: 0 })
  data.sort((a, b) => b.x - a.x)

  const xmin = data[0].x;
  const xmax = data[data.length - 1].x;
  let xpercent = (xmax - thr) / (xmax - xmin)
  // if (ww < 0.0001) { ww = .6416067 }
  // else { ww = ww; }
  // ww = .4;
  console.log('ww', xpercent)

  return <CardLight>
    <CardContent>
      <ComposedChart width={600} height={250} data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {/* <CartesianGrid strokeDasharray="4 4" /> */}
        <XAxis dataKey="x" type="number" domain={['auto', 'auto']} allowDecimals={false} />
        <YAxis dataKey="y" type="number" />
        {/* <Tooltip /> */}
        <Legend verticalAlign='top' height={36} />

        <defs>
          <linearGradient id={`splitOpacity${upgradeOpt.id}`} x1="0" y1="0" x2={xpercent} y2="0">
            <stop offset={1} stopColor='orange' stopOpacity={0} />
            <stop offset={0} stopColor='orange' stopOpacity={1} />
          </linearGradient>
        </defs>

        <Area type="monotone" dataKey="y" stroke="#8884d8" dot={false} fill={`url(#splitOpacity${upgradeOpt.id})`} opacity={.4} name='Estimated Damage Distribution' />
        <ReferenceLine x={upgradeOpt.params.thr} stroke="red" strokeDasharray="3 3" name="Current Damage" />

        {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
      </ComposedChart>
    </CardContent>
  </CardLight>
}
