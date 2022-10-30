import { CheckBox, CheckBoxOutlineBlank, Download, Replay } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, styled, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, ComposedChart, Label, Legend, Line, ResponsiveContainer, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import BootstrapTooltip from '../../../../../Components/BootstrapTooltip';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import InfoTooltip from '../../../../../Components/InfoTooltip';
import { NumNode } from '../../../../../Formula/type';
import { Build } from '../common';
import OptimizationTargetSelector from './OptimizationTargetSelector';

export type ChartData = {
  valueNode: NumNode,
  plotNode: NumNode,
  data: Build[]
}
type ChartCardProps = {
  chartData?: ChartData
  plotBase?: string[],
  setPlotBase: (path: string[] | undefined) => void
  disabled?: boolean
  showTooltip?: boolean
}
type Point = { x: number, y: number, min?: number }
export default function ChartCard({ chartData, plotBase, setPlotBase, disabled = false, showTooltip = false }: ChartCardProps) {
  const { t } = useTranslation(["page_character_optimize", "ui"])
  const [showDownload, setshowDownload] = useState(false)
  const [showMin, setshowMin] = useState(true)

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
          <BootstrapTooltip placement="top" title={showTooltip ? t("page_character_optimize:selectTargetFirst") : ""}>
            <span>
              <OptimizationTargetSelector
                optimizationTarget={plotBase}
                setTarget={target => setPlotBase(target)}
                defaultText={t("page_character_optimize:targetSelector.selectGraphTarget")}
                disabled={disabled}
              />
            </span>
          </BootstrapTooltip>
        </Grid>
        <Grid item>
          <BootstrapTooltip title={!plotBase ? "" : t("ui:reset")} placement="top">
            <span><Button color="error" onClick={() => setPlotBase(undefined)} disabled={!plotBase}>
              <Replay />
            </Button></span>
          </BootstrapTooltip>
        </Grid>
        <Grid item flexGrow={1}>
          <InfoTooltip placement="top" title={t("page_character_optimize:tcGraph.desc")} />
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
  // Below works because character translation should already be loaded
  const xLabel = <Label fill="white" dy={10}>
    {getLabelFromNode(plotNode, t)}
  </Label>
  const yLabel = <Label fill="white" angle={-90} dx={-40}>
    {getLabelFromNode(valueNode, t)}
  </Label>
  return <ResponsiveContainer width="100%" height={600}>
    <ComposedChart data={displayData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="x" scale="linear" unit={plotNode.info?.unit} domain={["auto", "auto"]} tick={{ fill: 'white' }} type="number" tickFormatter={n => n > 10000 ? n.toFixed() : n.toFixed(1)} label={xLabel} height={50} />
      <YAxis name="DMG" domain={["auto", "auto"]} unit={valueNode.info?.unit} allowDecimals={false} tick={{ fill: 'white' }} type="number" label={yLabel} width={100} />
      <ZAxis dataKey="y" range={[3, 25]} />
      <Legend />
      <Scatter name={t`tcGraph.optTarget`} dataKey="y" fill="#8884d8" line lineType="fitting" isAnimationActive={false} />
      {showMin && <Line name={t`tcGraph.minStatReqThr`} dataKey="min" stroke="#ff7300" type="stepBefore" connectNulls strokeWidth={2} isAnimationActive={false} />}
    </ComposedChart>
  </ResponsiveContainer>
}

function getLabelFromNode(node: NumNode, t: any) {
  console.log(node)
  return typeof node.info?.name === "string"
    ? node.info.name
    : `${t(`${node.info?.name?.props.ns}:${node.info?.name?.props.key18}`)}${node.info?.textSuffix ? ` ${node.info?.textSuffix}` : ""}`
}
