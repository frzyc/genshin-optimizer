import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Box, Typography } from "@mui/material"
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactSetKey, SetNum } from "../../Types/consts"
import BootstrapTooltip from "../BootstrapTooltip"
import CardDark from "../Card/CardDark"
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
    <CardDark sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ display: "flex", justifyContent: "space-between" }}>
        <span><SqBadge color="success">{setNumKey}-Set</SqBadge></span>
        <BootstrapTooltip placement="top" title={<Typography>{setEffectText}</Typography>}>
          <span><FontAwesomeIcon icon={faInfoCircle} /></span>
        </BootstrapTooltip>
      </Typography>
    </CardDark>
    {document ? <DocumentDisplay sections={document} /> : null}
  </Box>
}
