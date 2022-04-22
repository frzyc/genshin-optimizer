import {Button, CardContent} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {
  Area,
  ComposedChart,
  Legend,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import CardLight from '../Components/Card/CardLight';
import {UpgradeOptResult} from '../Formula/artifactQuery';
import {allUpgradeValues} from '../Formula/artifactUpgradeCrawl'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalculator} from "@fortawesome/free-solid-svg-icons";

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
export default function UpgradeOptChartCard({upgradeOpt}: Data) {

  const [calcExacts, setCalcExacts] = useState(false);

  const mu = upgradeOpt.params[0].mu;
  const std = upgradeOpt.params[0].std;
  const thr = upgradeOpt.params[0].thr;

  const miin = mu - std * 3;
  const maax = mu + std * 3;

  const ymax = (1.5 * (1 / (std * Math.sqrt(2 * Math.PI))))
  const gauss = ((x: number) => Math.exp(-(mu - x) * (mu - x) / std / std / 2) / Math.sqrt(2 * Math.PI) / std);

  let dataEst: ChartData[] = linspace(miin, maax, 100).map(v => {
    return {x: v, est: gauss(v)}
  })

  dataEst.push({x: thr, est: gauss(thr)})
  dataEst.push({x: thr + upgradeOpt.Edmg, est: gauss(thr + upgradeOpt.Edmg)})
  dataEst.sort((a, b) => a.x - b.x)
  const xmin = dataEst[0].x;
  const xmax = dataEst[dataEst.length - 1].x;
  let xpercent = (thr - xmin) / (xmax - xmin)

  const [data, setData] = useState<ChartData[]>(dataEst);

  const [trueP, setTrueP] = useState(0);

  useEffect(() => {
    if (!calcExacts) return;
    const exactData = allUpgradeValues(upgradeOpt)
    // const miin = exactData.reduce((prv, cur) => prv < cur.v ? prv : cur.v, exactData[0].v)
    // const maax = exactData.reduce((prv, cur) => prv > cur.v ? prv : cur.v, exactData[0].v)


    let true_p = 0
    let true_d = 0

    let binstep = (maax - miin) / nbins
    let bins = new Array(nbins).fill(0)
    let allbins: number[] = []


    exactData.forEach(({p, v}) => {
      let whichBin = Math.min(Math.trunc((v - miin) / binstep), nbins - 1)
      bins[whichBin] += p
      allbins.push(whichBin)

      if (v > thr) {
        true_p += p
        true_d += p * (v - thr)
      }
    })
    if (true_p > 0) true_d = true_d / true_p

    let dataExact: ChartData[] = bins.map((dens, ix) => ({x: miin + ix * binstep, exact: dens / binstep}))
    setTrueP(true_p)
    setData(dataEst.concat(dataExact))
  }, [calcExacts]);


  const CustomTooltip = ({
                           active,
                           payload,
                           label,
                         }: TooltipProps<string, string>) => {
    if (active) {
      // console.log({active})
      // console.log({payload})

      return (
        <div className="custom-tooltip">
          <p className="label"></p>
          <p className="desc">{trueP ? 'p' : 'p_est'}: {(trueP || upgradeOpt.Edmg).toFixed(3)}</p>
          <p className="desc">Expected Increase: {upgradeOpt.Edmg.toFixed(3)}</p>
        </div>
      )
    }

    return null;
  };

  return <CardLight>
    <CardContent>
      <ComposedChart width={600} height={250} data={data} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        {/* <CartesianGrid strokeDasharray="4 4" /> */}
        <XAxis dataKey="x" type="number" domain={['auto', 'auto']} allowDecimals={false}/>
        <YAxis type="number" domain={[0, ymax]} tickFormatter={v => parseFloat(v).toFixed(4)}/>
        {/* <Tooltip /> */}
        <Legend verticalAlign='top' height={36}/>

        <defs>
          <linearGradient id={`splitOpacity${upgradeOpt.id}`} x1="0" y1="0" x2={xpercent} y2="0">
            <stop offset={1} stopColor='orange' stopOpacity={0}/>
            <stop offset={0} stopColor='orange' stopOpacity={1}/>
          </linearGradient>
        </defs>

        <Area type="stepAfter" dataKey="exact" dot={false} opacity={.4} name='Exact Distribution (Histogram)'/>

        <Area type="monotone" dataKey="est" stroke="orange" dot={false} fill={`url(#splitOpacity${upgradeOpt.id})`}
              opacity={.5} name='Estimated Distribution'/>
        <ReferenceLine x={thr} stroke="red" strokeDasharray="3 3" name="Current Damage"/>
        <ReferenceLine x={thr + upgradeOpt.Edmg} stroke="#ffffff" strokeDasharray="3 3" name="Current Damage"/>
        <ReferenceArea x1={thr} stroke="gray" strokeOpacity={0.05}/>

        <Tooltip content={<CustomTooltip/>}/>


      </ComposedChart>

      <Button
        onClick={() => setCalcExacts(true)}
        startIcon={<FontAwesomeIcon icon={faCalculator}/>}
      >Generate Exact Values</Button>

      <br/>
      <span>Expected (avg) dmg increase = {upgradeOpt.Edmg}</span>
      <br/>
      <span>COMING SOON (tm): MinimumStatConstraint</span>
      <br/>
      <br/>

    </CardContent>
  </CardLight>
}
