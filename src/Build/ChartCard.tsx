import { Download, Info } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, MenuItem, styled, Tooltip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import DropdownButton from '../Components/DropdownMenu/DropdownButton';
import Stat from '../Stat';
import { StatKey } from '../Types/artifact';
type ChartCardProps = {
  data: Array<{ plotBase: number, optimizationTarget: number }>
  plotBase: StatKey | "",
  setPlotBase: (key: StatKey | "") => void
  statKeys: StatKey[]
  disabled?: boolean
}
export default function ChartCard({ data, plotBase, setPlotBase, statKeys, disabled = false }: ChartCardProps) {
  const [showDownload, setshowDownload] = useState(false)
  const { displayData, downloadData } = useMemo(() => {
    if (!data) return { displayData: null, downloadData: null }
    const displayData = [...data] as Array<{ plotBase: number, optimizationTarget: number, minTarget?: number }>
    let lastIndice = 0
    displayData.sort((a, b) => b.optimizationTarget - a.optimizationTarget)
    const init = displayData[0]
    displayData.map((ele, i) => {
      if (i === lastIndice) return displayData[i].minTarget = ele.optimizationTarget
      const last = displayData[lastIndice]
      if (ele.plotBase < last.plotBase) return false
      lastIndice = i
      return displayData[i].minTarget = ele.optimizationTarget
    })
    displayData.sort((a, b) => a.plotBase - b.plotBase)
    displayData[0].minTarget = init.optimizationTarget

    const downloadData = {
      minimum: displayData.filter(a => a.minTarget).map(({ plotBase, minTarget }) => [plotBase, minTarget]),
      allData: displayData.filter(a => a.optimizationTarget).map(({ plotBase, optimizationTarget }) => [plotBase, optimizationTarget]),
    }
    return { displayData, downloadData }
  }, [data])
  return <CardLight>
    <CardContent >
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Typography variant="h6" >Optimization Target vs</Typography>
        </Grid>
        <Grid item>
          <DropdownButton title={plotBase ? Stat.getStatNameWithPercent(plotBase) : "Not Selected"}
            color={plotBase ? "success" : "primary"}
            disabled={disabled}
          >
            <MenuItem onClick={() => { setPlotBase("") }}>Unselect</MenuItem>
            <Divider />
            {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => { setPlotBase(sKey) }}>{Stat.getStatNameWithPercent(sKey)}</MenuItem>)}
          </DropdownButton>
        </Grid>
        <Grid item flexGrow={1}>
          <Tooltip placement="top" title="Using data from the builder, this will generate a graph to visualize Optimization Target vs. a selected stat. The graph will show the maximum Optimization Target value per 0.01 of the selected stat. The minimum stat for each Optimized value is also outlined as a line above the scatter plot. ">
            <Info />
          </Tooltip>
        </Grid>

        {!!downloadData && <Grid item>
          <Button startIcon={<Download />} onClick={() => setshowDownload(!showDownload)}>Download Data</Button>
        </Grid>}
      </Grid>
    </CardContent>
    {!!displayData && <Divider />}
    {!!displayData && <CardContent>
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
      <Chart data={displayData} />
    </CardContent>}
  </CardLight >
}
const TextArea = styled("textarea")({
  width: "100%",
  fontFamily: "monospace",
  resize: "vertical",
  minHeight: "5em"
})
function DataDisplay({ data }: { data?: object }) {
  return <TextArea readOnly value={JSON.stringify(data)} onClick={e => {
    const target = e.target as HTMLTextAreaElement;
    target.selectionStart = 0;
    target.selectionEnd = target.value.length;
  }} />
}
function Chart({ data }) {
  if (!data) return null
  return <ResponsiveContainer width="100%" height={600}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="plotBase" name="ER" unit="%" scale="linear" domain={['dataMin', 'dataMax']} allowDecimals={false} tick={{ fill: 'white' }} />
      <YAxis name="DMG" domain={["auto", "auto"]} allowDecimals={false} tick={{ fill: 'white' }} />
      <ZAxis range={[7, 7]} />
      <Scatter name="A school" dataKey="optimizationTarget" fill="#8884d8" line lineType="fitting" />
      <Line dataKey="minTarget" stroke="#ff7300" type="stepBefore" dot={false} connectNulls strokeWidth={2} />
    </ComposedChart >
  </ResponsiveContainer>
}