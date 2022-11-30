import { CheckBox, CheckBoxOutlineBlank, Download, Replay } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, styled, Typography } from '@mui/material';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brush, CartesianGrid, ComposedChart, Label, Legend, LegendType, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import BootstrapTooltip from '../../../../../../Components/BootstrapTooltip';
import CardDark from '../../../../../../Components/Card/CardDark';
import CardLight from '../../../../../../Components/Card/CardLight';
import InfoTooltip from '../../../../../../Components/InfoTooltip';
import { CharacterContext } from '../../../../../../Context/CharacterContext';
import { DataContext } from '../../../../../../Context/DataContext';
import { GraphContext } from '../../../../../../Context/GraphContext';
import { ArtCharDatabase, DatabaseContext } from '../../../../../../Database/Database';
import { input } from '../../../../../../Formula';
import { NumNode } from '../../../../../../Formula/type';
import { allSlotKeys, SlotKey } from '../../../../../../Types/consts';
import { objectKeyValueMap, objPathValue } from '../../../../../../Util/Util';
import useBuildResult from '../../useBuildResult';
import OptimizationTargetSelector from '../OptimizationTargetSelector';
import CustomDot from './CustomDot';
import CustomTooltip from './CustomTooltip';
import { EnhancedPoint, getEnhancedPointY } from './EnhancedPoint';

export type Point = {
  x: number
  y: number
  artifactIds: string[]
  min?: number
}
type ChartCardProps = {
  plotBase?: string[]
  setPlotBase: (path: string[] | undefined) => void
  disabled?: boolean
  showTooltip?: boolean
}
export default function ChartCard({ plotBase, setPlotBase, disabled = false, showTooltip = false }: ChartCardProps) {
  const { t } = useTranslation(["page_character_optimize", "ui"])
  const { data } = useContext(DataContext)
  const { chartData } = useContext(GraphContext)
  const [showDownload, setshowDownload] = useState(false)
  const [showMin, setshowMin] = useState(true)

  const { displayData, downloadData } = useMemo(() => {
    if (!chartData) return { displayData: null, downloadData: null }
    const points = chartData.data.map(({ value: y, plot: x, artifactIds }) => ({ x, y, artifactIds })) as Point[]
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

  const plotBaseNode = plotBase && objPathValue(data?.getDisplay(), plotBase)
  const invalidTarget = plotBase && (!plotBaseNode || plotBaseNode.isEmpty)

  const buttonText = invalidTarget
    ? t("page_character_optimize:targetSelector.invalidTarget")
    : t("page_character_optimize:targetSelector.selectGraphTarget")

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
                defaultText={buttonText}
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

const optTargetColor = "#8884d8"
const highlightedColor = "cyan"
const currentColor = "#46a046"
const lineColor = "#ff7300"
function Chart({ displayData, plotNode, valueNode, showMin }: {
  displayData: Point[]
  plotNode: NumNode
  valueNode: NumNode
  showMin: boolean
}) {
  const { graphBuilds, setGraphBuilds } = useContext(GraphContext)
  const { data } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildResult: { builds } } = useBuildResult(characterKey)
  const { t } = useTranslation("page_character_optimize")
  const [selectedPoint, setSelectedPoint] = useState<EnhancedPoint>()
  const addBuildToList = useCallback((build: string[]) => setGraphBuilds([...(graphBuilds ?? []), build]), [setGraphBuilds, graphBuilds])
  // Convert from Point -> EnhancedPoint so we can get data for current and highlighted builds
  const enhancedDisplayData = useMemo(() => {
    const currentBuild = objectKeyValueMap(allSlotKeys, slotKey => [slotKey, data?.get(input.art[slotKey].id).value ?? ""])
    const highlightedBuilds = [...builds, ...(graphBuilds ?? [])]

    return displayData.map(datum => {
      const enhancedDatum: EnhancedPoint = {...datum}
      const datumSlotMap = convertArtiIdsToArtiSlotMap(datum.artifactIds, database)

      const isCurrentBuild = allSlotKeys.every(slotKey => currentBuild[slotKey] === datumSlotMap[slotKey])
      if (isCurrentBuild) {
        enhancedDatum.current = datum.y
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined
        return enhancedDatum
      }

      const isHighlightedBuild = highlightedBuilds.some(artiIds => {
        const highlightedSlotMap = convertArtiIdsToArtiSlotMap(artiIds, database)
        return allSlotKeys.every(slotKey => highlightedSlotMap[slotKey] === datumSlotMap[slotKey])
      })
      if (isHighlightedBuild) {
        enhancedDatum.highlighted = datum.y
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined
      }
      return enhancedDatum
    })
  }, [displayData, data, builds, graphBuilds, database])
  const chartOnClick = useCallback(props => {
    if (props && props.chartX && props.chartY) setSelectedPoint(getNearestPoint(props.chartX, props.chartY, 20, enhancedDisplayData))
  }, [setSelectedPoint, enhancedDisplayData])

  // Below works because character translation should already be loaded
  const xLabelValue = getLabelFromNode(plotNode, t)
  const yLabelValue = getLabelFromNode(valueNode, t)

  return <ResponsiveContainer width="100%" height={600}>
    <ComposedChart id="chartContainer" data={enhancedDisplayData} onClick={chartOnClick} style={{ cursor: "pointer" }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="x"
        scale="linear"
        unit={plotNode.info?.unit}
        domain={["auto", "auto"]}
        tick={{ fill: 'white' }}
        type="number"
        tickFormatter={n => n > 10000 ? n.toFixed() : n.toFixed(1)}
        label={<Label fill="white" dy={10}>{xLabelValue}</Label>}
        height={50}
      />
      <YAxis
        name="DMG"
        domain={["auto", "auto"]}
        unit={valueNode.info?.unit}
        allowDecimals={false}
        tick={{ fill: 'white' }}
        type="number"
        label={<Label fill="white" angle={-90} dx={-40}>{yLabelValue}</Label>}
        width={100}
      />
      <Tooltip
        content={<CustomTooltip
          xLabel={xLabelValue}
          xUnit={plotNode.info?.unit}
          yLabel={yLabelValue}
          yUnit={valueNode.info?.unit}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          addBuildToList={addBuildToList}
        />}
        trigger="click"
        wrapperStyle={{ pointerEvents: "auto", cursor: "auto" }}
        cursor={false}
      />
      <Legend payload={[
        ...(showMin ? [{ id: "min", value: t`tcGraph.minStatReqThr`, type: "line" as LegendType, color: lineColor }] : []),
        { id: "y", value: t`tcGraph.optTarget`, type: "circle", color: optTargetColor },
        { id: "highlighted", value: t`tcGraph.highlightedBuilds`, type: "square", color: highlightedColor },
        { id: "current", value: t`tcGraph.currentBuild`, type: "diamond", color: currentColor },
      ]}/>
      {showMin && <Line
        name={t`tcGraph.minStatReqThr`}
        dataKey="min"
        stroke={lineColor}
        type="stepBefore"
        connectNulls
        strokeWidth={2}
        isAnimationActive={false}
        dot={false}
        activeDot={false}
      />}
      <Scatter
        name={t`tcGraph.optTarget`}
        dataKey="y"
        fill={optTargetColor}
        isAnimationActive={false}
        shape={<CustomDot selectedPoint={selectedPoint} colorUnselected={optTargetColor} />}
      />
      <Scatter
        name={t`tcGraph.highlightedBuilds`}
        dataKey="highlighted"
        fill={highlightedColor}
        isAnimationActive={false}
        shape={<CustomDot shape="square" selectedPoint={selectedPoint} colorUnselected={highlightedColor} />}
      />
      <Scatter
        name={t`tcGraph.currentBuild`}
        dataKey="current"
        fill={currentColor}
        isAnimationActive={false}
        shape={<CustomDot shape="diamond" selectedPoint={selectedPoint} colorUnselected={currentColor} />}
      />
      <Brush dataKey="x" height={30} gap={10} travellerWidth={20} tickFormatter={n => n.toFixed()} />
    </ComposedChart>
  </ResponsiveContainer>
}

function convertArtiIdsToArtiSlotMap(artifactIds: string[], database: ArtCharDatabase) {
  // Create partial mapping of slotkey -> build artifact
  const partialArtiSlotMap: Dict<SlotKey, string> = Object.fromEntries(artifactIds.map(artiId => {
    const arti = database.arts.get(artiId)
    return arti ? [arti.slotKey, arti.id] : []
  }))
  // Fill in the blanks so we have a StrictDict<SlotKey, string>
  return objectKeyValueMap(allSlotKeys, slotKey => [slotKey, partialArtiSlotMap[slotKey] ?? ""])
}

function getNearestPoint(clickedX: number, clickedY: number, threshold: number, data: EnhancedPoint[]) {
  const nearestDomPtData = Array.from(document.querySelectorAll(".custom-dot"))
    .reduce((domPtA, domPtB) => {
      const { chartX: aChartX, chartY: aChartY } = (domPtA as any).dataset
      const aDistance = Math.sqrt((clickedX - aChartX) ** 2 + (clickedY - aChartY) ** 2)
      const { chartX: bChartX, chartY: bChartY } = (domPtB as any).dataset
      const bDistance = Math.sqrt((clickedX - bChartX) ** 2 + (clickedY - bChartY) ** 2)
      return aDistance <= bDistance
        ? domPtA
        : domPtB
    })["dataset"]

  // Don't select a point too far away
  const distance = Math.sqrt((clickedX - nearestDomPtData.chartX) ** 2 + (clickedY - nearestDomPtData.chartY) ** 2)
  return distance < threshold
    ? data.find(d => d.x === +nearestDomPtData.xValue && getEnhancedPointY(d) === +nearestDomPtData.yValue)
    : undefined
}

function getLabelFromNode(node: NumNode, t: any) {
  return typeof node.info?.name === "string"
    ? node.info.name
    : `${t(`${node.info?.name?.props.ns}:${node.info?.name?.props.key18}`)}${node.info?.textSuffix ? ` ${node.info?.textSuffix}` : ""}`
}
