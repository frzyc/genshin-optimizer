import { CheckBox, CheckBoxOutlineBlank, Download, Info } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, MenuItem, styled, Tooltip, Typography } from '@mui/material';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import DropdownButton from '../../../../../Components/DropdownMenu/DropdownButton';
import { DataContext } from '../../../../../Context/DataContext';
import { uiInput as input } from '../../../../../Formula';
import { NumNode } from '../../../../../Formula/type';
import KeyMap from '../../../../../KeyMap';
import { MainStatKey, SubstatKey } from '../../../../../Types/artifact';
import { Build } from '../common';

export type ChartData = {
  valueNode: NumNode,
  plotNode: NumNode,
  data: Build[]
}
type ChartCardProps = {
  chartData?: ChartData
  plotBase: MainStatKey | SubstatKey | "",
  setPlotBase: (key: MainStatKey | SubstatKey | "") => void
  disabled?: boolean
}
type Point = { x: number, y: number, min?: number }
export default function ChartCard({ chartData, plotBase, setPlotBase, disabled = false }: ChartCardProps) {
  const { t } = useTranslation(["page_character_optimize", "ui"])
  const [showDownload, setshowDownload] = useState(false)
  const [showMin, setshowMin] = useState(true)
  const { data } = useContext(DataContext)
  const statKeys = ["atk", "hp", "def", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_"]
  if (data.get(input.weaponType).value !== "catalyst") statKeys.push("physical_dmg_")
  statKeys.push(`${data.get(input.charEle).value}_dmg_`)

  const { displayData, downloadData } = useMemo(() => {
    if (!chartData) return { displayData: null, downloadData: null }
    const points = chartData.data.map(({ value: y, plot: x }) => ({ x, y })) as Point[]
    const increasingX: Point[] = points.sort((a, b) => a.x - b.x)
    const minimumData: Point[] = []
    for (const point of increasingX) {
      let last: Point | undefined
      while ((last = minimumData.pop())) {
        if (last.y > point.y) {
          minimumData.push(last)
          break
        }
      }
      minimumData.push(point)
    }

    // Note:
    // We can also just use `minimumData` if the plotter supports multiple data sources.
    // It could be faster too since there're no empty entries in `minimumData`.
    if (minimumData[0]?.x !== increasingX[0]?.x)
      increasingX[0].min = minimumData[0].y
    minimumData.forEach(x => { x.min = x.y })

    const downloadData = {
      minimum: minimumData.map(({ x, y }) => [x, y]),
      allData: increasingX.map(({ x, y }) => [x, y]),
    }
    return { displayData: increasingX, downloadData }
  }, [chartData])

  return <CardLight>
    <CardContent>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Typography >{t`tcGraph.vs`}</Typography>
        </Grid>
        <Grid item>
          <DropdownButton size='small' title={plotBase ? KeyMap.get(plotBase) : t`tcGraph.notSel`}
            color={plotBase ? "success" : "primary"}
            disabled={disabled}
          >
            <MenuItem onClick={() => { setPlotBase("") }}>{t`ui:unselect`}</MenuItem>
            <Divider />
            {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => { setPlotBase(sKey as any) }}>{KeyMap.get(sKey)}</MenuItem>)}
          </DropdownButton>
        </Grid>
        <Grid item flexGrow={1}>
          <Tooltip placement="top" title="Using data from the builder, this will generate a graph to visualize Optimization Target vs. a selected stat. The graph will show the maximum Optimization Target value per 0.01 of the selected stat.">
            <Info />
          </Tooltip>
        </Grid>
        {!!downloadData && <Grid item>
          <Button size='small' startIcon={showMin ? <CheckBox /> : <CheckBoxOutlineBlank />}
            color={showMin ? "success" : "secondary"}
            onClick={() => setshowMin(!showMin)}>{t`tcGraph.showMinStatThr`}</Button>
        </Grid>}
        {!!downloadData && <Grid item>
          <Button size='small' color="info" startIcon={<Download />} onClick={() => setshowDownload(!showDownload)}>{t`tcGraph.downloadData`}</Button>
        </Grid>}
      </Grid>
    </CardContent>
    {!!displayData && <Divider />}
    {chartData && !!displayData && <CardContent>
      <Collapse in={!!downloadData && showDownload}>
        <CardDark sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Min Data</Typography>
            <DataDisplay data={downloadData?.minimum} />
            <Typography>All Data</Typography>
            <DataDisplay data={downloadData?.allData} />
          </CardContent>
        </CardDark>
      </Collapse>
      <Chart displayData={displayData} plotNode={chartData.plotNode} valueNode={chartData.valueNode} showMin={showMin} />
    </CardContent>}
  </CardLight >
}
const TextArea = styled("textarea")({
  width: "100%",
  fontFamily: "monospace",
  resize: "vertical",
  minHeight: "5em"
})
function DataDisplay({ data, }: { data?: object }) {
  return <TextArea readOnly value={JSON.stringify(data)} onClick={e => {
    const target = e.target as HTMLTextAreaElement;
    target.selectionStart = 0;
    target.selectionEnd = target.value.length;
  }} />
}
function Chart({ displayData, plotNode, valueNode, showMin }: {
  displayData: Point[],
  plotNode: NumNode,
  valueNode: NumNode,
  showMin: boolean
}) {
  const { t } = useTranslation("page_character_optimize")
  const plotBaseUnit = KeyMap.unit(plotNode.info?.key)
  const valueUnit = KeyMap.unit(valueNode.info?.key)
  return <ResponsiveContainer width="100%" height={600}>
    <ComposedChart data={displayData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" scale="linear" unit={plotBaseUnit} domain={["auto", "auto"]} tick={{ fill: 'white' }} type="number" tickFormatter={n => n > 10000 ? n.toFixed() : n.toFixed(1)} />
      <YAxis name="DMG" domain={["auto", "auto"]} unit={valueUnit} allowDecimals={false} tick={{ fill: 'white' }} type="number" />
      <ZAxis dataKey="y" range={[3, 25]} />
      <Legend />
      <Scatter name={t`tcGraph.optTarget`} dataKey="y" fill="#8884d8" line lineType="fitting" isAnimationActive={false} />
      {showMin && <Line name={t`tcGraph.minStatReqThr`} dataKey="min" stroke="#ff7300" type="stepBefore" connectNulls strokeWidth={2} isAnimationActive={false} />}
    </ComposedChart>
  </ResponsiveContainer>
}
