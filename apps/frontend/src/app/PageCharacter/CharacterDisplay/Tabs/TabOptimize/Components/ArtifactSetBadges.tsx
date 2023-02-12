import { ArtifactSetKey, ArtifactSlotKey } from "@genshin-optimizer/consts"
import { Box, Typography } from "@mui/material"
import { useMemo } from "react"
import ArtifactSetTooltip from "../../../../../Components/Artifact/ArtifactSetTooltip"
import SlotIcon from "../../../../../Components/Artifact/SlotIcon"
import SqBadge from "../../../../../Components/SqBadge"
import { getArtSheet } from "../../../../../Data/Artifacts"
import { iconInlineProps } from "../../../../../SVGIcons"
import { ICachedArtifact } from "../../../../../Types/artifact"

type ArtifactSetBadgesProps = {
  artifacts: ICachedArtifact[],
  currentlyEquipped?: boolean
}
export function ArtifactSetBadges({ artifacts, currentlyEquipped = false }: ArtifactSetBadgesProps) {
  const setToSlots: Partial<Record<ArtifactSetKey, ArtifactSlotKey[]>> = useMemo(() => artifacts
    .filter(arti => arti)
    .reduce((acc, curr) => {
      acc[curr.setKey] ? acc[curr.setKey].push(curr.slotKey) : acc[curr.setKey] = [curr.slotKey]
      return acc
    }, {}),
    [artifacts]
  )
  return <>{Object.entries(setToSlots)
    .sort(([_k1, slotarr1], [_k2, slotarr2]) => slotarr2.length - slotarr1.length)
    .map(([key, slotarr]) =>
      <ArtifactSetBadge key={key} setKey={key} currentlyEquipped={currentlyEquipped} slotarr={slotarr} />
    )
  }</>

}
function ArtifactSetBadge({ setKey, currentlyEquipped = false, slotarr }: { setKey: ArtifactSetKey, currentlyEquipped: boolean, slotarr: ArtifactSlotKey[] }) {
  const artifactSheet = getArtSheet(setKey)
  const numInSet = slotarr.length
  const setActive = Object.keys(artifactSheet.setEffects).map((setKey) => parseInt(setKey)).filter(setNum => setNum <= numInSet)
  return <Box>
    <ArtifactSetTooltip artifactSheet={artifactSheet} numInSet={numInSet} >
      <SqBadge sx={{ height: "100%" }} color={currentlyEquipped ? "success" : "primary"} ><Typography >
        {slotarr.map(slotKey => <SlotIcon key={slotKey} slotKey={slotKey} iconProps={iconInlineProps} />)} {artifactSheet.name ?? ""}
        {setActive.map((n, i) => <SqBadge sx={{ ml: 0.5 }} key={"" + n + i} color="success">{n}</SqBadge>)}
      </Typography></SqBadge>
    </ArtifactSetTooltip>
  </Box>
}
