import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Box, Typography } from "@mui/material"
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactSetKey, SetNum } from "../../Types/consts"
import BootstrapTooltip from "../BootstrapTooltip"
import DocumentDisplay from "../DocumentDisplay"
import SqBadge from "../SqBadge"

type Data = {
  setKey: ArtifactSetKey,
  setNumKey: SetNum
}

export default function SetEffectDisplay({ setKey, setNumKey }: Data) {
  const sheet = usePromise(ArtifactSheet.get(setKey), [setKey])
  if (!sheet) return null

  const setEffectText = sheet.setEffectDesc(setNumKey)
  const document = sheet.setEffectDocument(setNumKey)
  return <Box display="flex" flexDirection="column" gap={1}>
    <Typography variant="h6"><BootstrapTooltip placement="top" title={<Typography>{setEffectText}</Typography>}>
      <span><SqBadge color="success">{setNumKey}-Set <FontAwesomeIcon icon={faInfoCircle} /></SqBadge></span>
    </BootstrapTooltip></Typography>
    {document ? <DocumentDisplay sections={document} /> : null}
  </Box>
}
