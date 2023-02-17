import { allArtifactSlotKeys } from '@genshin-optimizer/consts';
import { CheckBox, CheckBoxOutlineBlank, Download, Replay } from '@mui/icons-material';
import { Button, CardContent, Collapse, Divider, Grid, Slider, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, ComposedChart, Label, Legend, LegendType, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import BootstrapTooltip from '../../../../../../Components/BootstrapTooltip';
import CardDark from '../../../../../../Components/Card/CardDark';
import CardLight from '../../../../../../Components/Card/CardLight';
import InfoTooltip from '../../../../../../Components/InfoTooltip';
import ReadOnlyTextArea from '../../../../../../Components/ReadOnlyTextArea';
import { CharacterContext } from '../../../../../../Context/CharacterContext';
import { DataContext } from '../../../../../../Context/DataContext';
import { GraphContext } from '../../../../../../Context/GraphContext';
import { input } from '../../../../../../Formula';
import { NumNode } from '../../../../../../Formula/type';
import { valueString } from '../../../../../../KeyMap';
import { objectKeyMap, objPathValue } from '../../../../../../Util/Util';
import useBuildResult from '../../useBuildResult';
import OptimizationTargetSelector from '../OptimizationTargetSelector';
import CustomDot from './CustomDot';
import CustomTooltip from './CustomTooltip';
import EnhancedPoint from './EnhancedPoint';

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
  const { graphBuilds } = useContext(GraphContext)
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildResult: { builds: generatedBuilds } } = useBuildResult(characterKey)

  const [sliderLow, setSliderLow] = useState(-Infinity)
  const [sliderHigh, setSliderHigh] = useState(Infinity)
  const setSlider = useCallback(
    (_e: unknown, value: number | number[]) => {
      if (typeof value === "number") throw new TypeError()
      const [l, h] = value
      setSliderLow(l)
      setSliderHigh(h)
    },
    [setSliderLow, setSliderHigh]
  )
  useEffect(() => { setSliderLow(-Infinity); setSliderHigh(Infinity) }, [chartData])

  const { displayData, downloadData, sliderMin, sliderMax } = useMemo(() => {
    if (!chartData) return { displayData: null, downloadData: null }
    let sliderMin = Infinity
    let sliderMax = -Infinity
    const currentBuild = allArtifactSlotKeys.map(slotKey => data?.get(input.art[slotKey].id).value ?? "")
    // Shape the data so we know the current and highlighted builds
    const points = chartData.data.map(({ value: y, plot: x, artifactIds }) => {
      if (x === undefined) return null
      if (x < sliderMin) sliderMin = x
      if (x > sliderMax) sliderMax = x
      const enhancedDatum: EnhancedPoint = new EnhancedPoint(x, y, artifactIds)
      const datumBuildMap = objectKeyMap(artifactIds, _ => true)

      const isCurrentBuild = currentBuild.every(aId => datumBuildMap[aId])
      if (isCurrentBuild) {
        enhancedDatum.current = y
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined
        return enhancedDatum
      }

      const generBuildIndex = generatedBuilds.findIndex(build =>
        build.every(aId => datumBuildMap[aId])
      )
      if (generBuildIndex !== -1) {
        enhancedDatum.highlighted = y
        enhancedDatum.buildNumber = generBuildIndex + 1
        enhancedDatum.highlightedType = "generated"
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined
        return enhancedDatum
      }

      const graphBuildIndex = graphBuilds?.findIndex(build =>
        build.every(aId => datumBuildMap[aId])
      )
      if (graphBuildIndex !== undefined && graphBuildIndex !== -1) {
        enhancedDatum.highlighted = y
        enhancedDatum.buildNumber = graphBuildIndex + 1
        enhancedDatum.highlightedType = "graph"
        // Remove the Y-value so there are not 2 dots displayed for these builds
        enhancedDatum.y = undefined
      }

      return enhancedDatum
    })
      .filter((pt): pt is NonNullable<EnhancedPoint> => pt !== null)
      .sort((a, b) => a.x - b.x)

    const minimumData: EnhancedPoint[] = []
    for (const point of points) {
      let last: EnhancedPoint | undefined
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
    // From my limited testing, using multiple data sources makes the graph behave strangely though.
    if (minimumData[0]?.x !== points[0]?.x)
      points[0].min = minimumData[0].y
    minimumData.forEach(pt => { pt.min = pt.y })

    const downloadData = {
      minimum: minimumData.map(point => [point.x, point.y]),
      allData: points.map(point => [point.x, point.y]),
    }
    return { displayData: points.filter(pt => pt && pt.x >= sliderLow && pt.x <= sliderHigh), downloadData, sliderMin, sliderMax }
  }, [chartData, generatedBuilds, data, graphBuilds, sliderLow, sliderHigh])

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
            <span><Button color="error" onClick={() => setPlotBase(undefined)} disabled={!plotBase || disabled}>
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
            onClick={() => setshowMin(!showMin)}>{t`tcGraph.showStatThr`}</Button>
        </Grid>}
        {!!downloadData && <Grid item>
          <Button size='small' color="info" startIcon={<Download />} onClick={() => setshowDownload(!showDownload)}>{t`tcGraph.downloadData`}</Button>
        </Grid>}
      </Grid>
    </CardContent>
    {displayData && displayData.length && <Divider />}
    {chartData && displayData && displayData.length && <CardContent>
      <Collapse in={!!downloadData && showDownload}>
        <CardDark sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Min Data</Typography>
            <ReadOnlyTextArea value={JSON.stringify(downloadData?.minimum)} />
            <Typography>All Data</Typography>
            <ReadOnlyTextArea value={JSON.stringify(downloadData?.allData)} />
          </CardContent>
        </CardDark>
      </Collapse>
      <Chart displayData={displayData} plotNode={chartData.plotNode} valueNode={chartData.valueNode} showMin={showMin} />
      {displayData.length > 1 && <Slider
        marks
        value={[sliderLow, sliderHigh]}
        onChange={setSlider}
        onChangeCommitted={setSlider}
        min={sliderMin}
        max={sliderMax}
        step={(sliderMax - sliderMin) / 20}
        valueLabelDisplay="auto"
        valueLabelFormat={n => valueString(chartData.plotNode.info?.unit === "%" ? n / 100 : n, chartData.plotNode.info?.unit)}
        sx={{ ml: "6%", width: "93%" }}
      />}
    </CardContent>}
  </CardLight >
}

const optTargetColor = "#8884d8"
const highlightedColor = "cyan"
const currentColor = "#46a046"
const lineColor = "#ff7300"
function Chart({ displayData, plotNode, valueNode, showMin }: {
  displayData: EnhancedPoint[]
  plotNode: NumNode
  valueNode: NumNode
  showMin: boolean
}) {
  const { graphBuilds, setGraphBuilds } = useContext(GraphContext)
  const { t } = useTranslation("page_character_optimize")
  const [selectedPoint, setSelectedPoint] = useState<EnhancedPoint>()
  const addBuildToList = useCallback((build: string[]) => { setGraphBuilds([...(graphBuilds ?? []), build]); setSelectedPoint(undefined) }, [setGraphBuilds, graphBuilds])
  const chartOnClick = useCallback(props => {
    if (props && props.chartX && props.chartY) setSelectedPoint(getNearestPoint(props.chartX, props.chartY, 20, displayData))
  }, [setSelectedPoint, displayData])

  // Below works because character translation should already be loaded
  const xLabelValue = getLabelFromNode(plotNode, t)
  const yLabelValue = getLabelFromNode(valueNode, t)

  return <ResponsiveContainer width="100%" height={600}>
    <ComposedChart id="chartContainer" data={displayData} onClick={chartOnClick} style={{ cursor: "pointer" }}>
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
        ...(showMin ? [{ id: "min", value: t`tcGraph.statReqThr`, type: "line" as LegendType, color: lineColor }] : []),
        { id: "trueY", value: t`tcGraph.generatedBuilds`, type: "circle", color: optTargetColor },
        { id: "highlighted", value: t`tcGraph.highlightedBuilds`, type: "square", color: highlightedColor },
        { id: "current", value: t`tcGraph.currentBuild`, type: "diamond", color: currentColor },
      ]} />
      {showMin && <Line
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
        dataKey="trueY"
        isAnimationActive={false}
        shape={<CustomDot selectedPoint={selectedPoint} colorUnselected={optTargetColor} />}
      />
      <Scatter
        dataKey="highlighted"
        isAnimationActive={false}
        shape={<CustomDot shape="square" selectedPoint={selectedPoint} colorUnselected={highlightedColor} />}
      />
      <Scatter
        dataKey="current"
        isAnimationActive={false}
        shape={<CustomDot shape="diamond" selectedPoint={selectedPoint} colorUnselected={currentColor} />}
      />
    </ComposedChart>
  </ResponsiveContainer>
}

interface DomPt extends Element {
  dataset: {
    chartX: number
    chartY: number
    xValue: string
    yValue: string
  },
}
function getNearestPoint(clickedX: number, clickedY: number, threshold: number, data: EnhancedPoint[]) {
  const nearestDomPtData = Array.from(document.querySelectorAll<DomPt>(".custom-dot"))
    .reduce((domPtA, domPtB) => {
      const { chartX: aChartX, chartY: aChartY } = domPtA.dataset
      const aDistance = Math.sqrt((clickedX - aChartX) ** 2 + (clickedY - aChartY) ** 2)
      const { chartX: bChartX, chartY: bChartY } = domPtB.dataset
      const bDistance = Math.sqrt((clickedX - bChartX) ** 2 + (clickedY - bChartY) ** 2)
      return aDistance <= bDistance
        ? domPtA
        : domPtB
    })["dataset"]

  // Don't select a point too far away
  const distance = Math.sqrt((clickedX - nearestDomPtData.chartX) ** 2 + (clickedY - nearestDomPtData.chartY) ** 2)
  return distance < threshold
    ? data.find(d => d.x === +nearestDomPtData.xValue && d.y === +nearestDomPtData.yValue)
    : undefined
}

function getLabelFromNode(node: NumNode, t: TFunction) {
  return typeof node.info?.name === "string"
    ? node.info.name
    : `${t(`${node.info?.name?.props.ns}:${node.info?.name?.props.key18}`)}${node.info?.textSuffix ? ` ${node.info?.textSuffix}` : ""}`
}
