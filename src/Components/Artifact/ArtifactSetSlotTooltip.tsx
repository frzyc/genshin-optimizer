import { Box, Skeleton, Typography } from "@mui/material";
import { ReactElement, ReactNode, Suspense } from "react";
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet";
import { SlotKey } from "../../Types/consts";
import BootstrapTooltip from "../BootstrapTooltip";
import { artifactSlotIcon } from "./SlotNameWIthIcon";

type Data = {
  slotKey: SlotKey,
  sheet: ArtifactSheet | undefined,
  children: ReactElement<any, any> & ReactNode,
}
export default function ArtifactSetSlotTooltip({ slotKey, sheet, children }: Data) {
  const fallback = <Box>
    <Skeleton variant="text" width={100} />
    <Skeleton variant="text" width={100} />
  </Box>
  const title = <Suspense fallback={fallback}>
    <Box>
      <Typography><strong>{sheet?.name}</strong></Typography>
      <Typography>{artifactSlotIcon(slotKey)} {sheet?.getSlotName?.(slotKey)}</Typography>
    </Box>
  </Suspense>

  return <BootstrapTooltip placement="top" title={title} disableInteractive>
    {children}
  </BootstrapTooltip>
}
