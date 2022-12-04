import { Button, CardContent, ClickAwayListener, Grid, Skeleton, Stack, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { TooltipProps } from "recharts"
import ArtifactCardPico from "../../../../../../Components/Artifact/ArtifactCardPico"
import BootstrapTooltip from "../../../../../../Components/BootstrapTooltip"
import CardDark from "../../../../../../Components/Card/CardDark"
import CloseButton from "../../../../../../Components/CloseButton"
import SqBadge from "../../../../../../Components/SqBadge"
import { CharacterContext } from "../../../../../../Context/CharacterContext"
import { DataContext } from "../../../../../../Context/DataContext"
import { GraphContext } from "../../../../../../Context/GraphContext"
import { DatabaseContext } from "../../../../../../Database/Database"
import { input } from "../../../../../../Formula"
import { Unit, valueString } from "../../../../../../KeyMap"
import { ICachedArtifact } from "../../../../../../Types/artifact"
import { allSlotKeys } from "../../../../../../Types/consts"
import useBuildResult from "../../useBuildResult"
import { ArtifactSetBadges } from "../ArtifactSetBadges"
import EnhancedPoint from "./EnhancedPoint"

type CustomTooltipProps = TooltipProps<number, string> & {
  xLabel: Displayable
  xUnit: Unit | undefined
  yLabel: Displayable
  yUnit: Unit | undefined
  selectedPoint: EnhancedPoint | undefined
  setSelectedPoint: (pt: EnhancedPoint | undefined) => void
  addBuildToList: (build: string[]) => void
}
export default function CustomTooltip({ xLabel, xUnit, yLabel, yUnit, selectedPoint, setSelectedPoint, addBuildToList, ...tooltipProps }: CustomTooltipProps) {
  const { database } = useContext(DatabaseContext)
  const { data } = useContext(DataContext)
  const { t } = useTranslation("page_character_optimize")
  const { graphBuilds } = useContext(GraphContext)
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildResult: { builds } } = useBuildResult(characterKey)

  const canAddBuild = useMemo(() => ![...builds, ...(graphBuilds ?? [])].some(artiIds =>
    artiIds.every(id => selectedPoint?.artifactIds.includes(id))
  ), [builds, graphBuilds, selectedPoint])

  const artifactsBySlot: { [slot: string]: ICachedArtifact } = useMemo(() =>
    selectedPoint && selectedPoint.artifactIds && Object.fromEntries(selectedPoint.artifactIds
      .map(id => {
        const artiObj = database.arts.get(id)
        return [artiObj?.slotKey, artiObj]
      })
      .filter(arti => arti)
    ),
    [database.arts, selectedPoint]
  )
  const clickAwayHandler = useCallback((e) => {
    if (!(e.target.id.includes("customShape") || e.target.id.includes("chartContainer"))) {
      setSelectedPoint(undefined)
    }
  }, [setSelectedPoint])

  const currentlyEquipped = artifactsBySlot && allSlotKeys.every(slotKey => artifactsBySlot[slotKey]?.id === data.get(input.art[slotKey].id).value)

  if (tooltipProps.active && selectedPoint) {
    return <ClickAwayListener onClickAway={clickAwayHandler}>
      <CardDark sx={{ minWidth: "400px", maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
        <CardContent>
          <Stack gap={1}>
            <Stack direction="row" alignItems="start" gap={1}>
              <Stack spacing={0.5} flexGrow={99}>
                {currentlyEquipped && <SqBadge color="info"><strong>{t("currentlyEquippedBuild")}</strong></SqBadge>}
                <Suspense fallback={<Skeleton width={300} height={50} />}>
                  <ArtifactSetBadges artifacts={Object.values(artifactsBySlot)} currentlyEquipped={currentlyEquipped} />
                </Suspense>
              </Stack>
              <Grid item flexGrow={1} />
              <CloseButton onClick={() => setSelectedPoint(undefined)} />
            </Stack>
            <Grid container direction="row" spacing={0.75} columns={5}>
              {allSlotKeys.map(key =>
                <Grid item key={key} xs={1}>
                  <Suspense fallback={<Skeleton width={75} height={75} />}>
                    <ArtifactCardPico artifactObj={artifactsBySlot[key]} slotKey={key} />
                  </Suspense>
                </Grid>
              )}
            </Grid>
            <Typography><strong>{xLabel}</strong>: {valueString(xUnit === "%" ? selectedPoint.x / 100 : selectedPoint.x, xUnit)}</Typography>
            <Typography><strong>{yLabel}</strong>: {valueString(yUnit === "%" ? selectedPoint.y / 100 : selectedPoint.y, yUnit)}</Typography>
            <BootstrapTooltip title={canAddBuild ? "" : t("tcGraph.buildAlreadyInList")} placement="top">
              <span>
                <Button sx={{ width: "100%" }} disabled={!canAddBuild} color="info" onClick={() => addBuildToList(selectedPoint.artifactIds)}>{t("addBuildToList")}</Button>
              </span>
            </BootstrapTooltip>
          </Stack>
        </CardContent>
      </CardDark>
    </ClickAwayListener>
  }

  return null
}
