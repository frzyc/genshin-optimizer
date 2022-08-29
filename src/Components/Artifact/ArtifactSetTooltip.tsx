import { Box, Skeleton, Stack, Typography } from "@mui/material"
import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet"
import BootstrapTooltip from "../BootstrapTooltip"
import SqBadge from "../SqBadge"
import { Translate } from "../Translate"

export default function ArtifactSetTooltip({ children, artifactSheet, numInSet = 5 }: { children: JSX.Element, artifactSheet: ArtifactSheet, numInSet?: number }) {
  return <BootstrapTooltip placement="top" title={<ArtifactSetTooltipContent artifactSheet={artifactSheet} numInSet={numInSet} />} disableInteractive >
    {children}
  </BootstrapTooltip>
}
export function ArtifactSetTooltipContent({ artifactSheet, numInSet = 5 }: { artifactSheet: ArtifactSheet, numInSet?: number }) {
  return <Suspense fallback={<Skeleton variant='rectangular' width={100} height={100} />}>
    <SetToolTipTitle artifactSheet={artifactSheet} numInSet={numInSet} />
  </Suspense>
}
function SetToolTipTitle({ artifactSheet, numInSet = 5 }: { artifactSheet: ArtifactSheet, numInSet?: number }) {
  const { t } = useTranslation("sheet")
  return <Stack spacing={2} sx={{ p: 1 }}>
    {Object.keys(artifactSheet.setEffects).map((setKey) => <Box key={setKey} sx={{ opacity: parseInt(setKey) <= numInSet ? 1 : 0.5 }}>
      <Typography><SqBadge color="success">{t(`${setKey}set`)}</SqBadge></Typography>
      <Typography><Translate ns={`artifact_${artifactSheet.key}_gen`} key18={`setEffects.${setKey}`} /></Typography>
    </Box>
    )}
  </Stack>
}
