import { Box, Typography } from "@mui/material"
import { useMemo } from "react"
import ArtifactSetTooltip from "../../../../../Components/Artifact/ArtifactSetTooltip"
import { artifactSlotIcon } from "../../../../../Components/Artifact/SlotNameWIthIcon"
import SqBadge from "../../../../../Components/SqBadge"
import { ArtifactSheet } from "../../../../../Data/Artifacts/ArtifactSheet"
import usePromise from "../../../../../ReactHooks/usePromise"
import { ICachedArtifact } from "../../../../../Types/artifact"
import { ArtifactSetKey, SlotKey } from "../../../../../Types/consts"

type ArtifactSetBadgesProps = {
  artifacts: ICachedArtifact[],
  currentlyEquipped?: boolean
}
export function ArtifactSetBadges({ artifacts, currentlyEquipped = false }: ArtifactSetBadgesProps) {
  const setToSlots: Partial<Record<ArtifactSetKey, SlotKey[]>> = useMemo(() => artifacts
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
function ArtifactSetBadge({ setKey, currentlyEquipped = false, slotarr }: { setKey: ArtifactSetKey, currentlyEquipped: boolean, slotarr: SlotKey[] }) {
  const artifactSheet = usePromise(() => ArtifactSheet.get(setKey), [])
  if (!artifactSheet) return null
  const numInSet = slotarr.length
  const setActive = Object.keys(artifactSheet.setEffects).map((setKey) => parseInt(setKey)).filter(setNum => setNum <= numInSet)
  return <Box>
    <ArtifactSetTooltip artifactSheet={artifactSheet} numInSet={numInSet} >
      <SqBadge sx={{ height: "100%" }} color={currentlyEquipped ? "success" : "primary"} ><Typography >
        {slotarr.map(slotKey => artifactSlotIcon(slotKey))} {artifactSheet.name ?? ""}
        {setActive.map(n => <SqBadge sx={{ ml: 0.5 }} key={n} color="success">{n}</SqBadge>)}
      </Typography></SqBadge>
    </ArtifactSetTooltip>
  </Box>
}
