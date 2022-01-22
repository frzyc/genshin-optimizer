import { Box, CardContent, Typography } from "@mui/material"
import CardDark from "../../Components/Card/CardDark"
import DocumentDisplay from "../../Components/DocumentDisplay"
import SqBadge from "../../Components/SqBadge"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactSetKey, SetNum } from "../../Types/consts"
import { ArtifactSheet } from "../ArtifactSheet_WR"

type Data = {
  setKey: ArtifactSetKey,
  setNumKey: SetNum,
  skipConditionalEquipmentCheck?: boolean
}

export default function SetEffectDisplay({ setKey, setNumKey, skipConditionalEquipmentCheck }: Data) {
  const sheet = usePromise(ArtifactSheet.get(setKey), [setKey])
  if (!sheet) return null

  const setEffectText = sheet.setEffectDesc(setNumKey)
  const document = sheet.setEffectDocument(setNumKey)
  return <Box display="flex" flexDirection="column" gap={1}>
    <CardDark>
      <CardContent>
        <Typography><SqBadge color="success">{setNumKey}-Set</SqBadge> {setEffectText}</Typography>
      </CardContent>
    </CardDark>
    {document ? <DocumentDisplay sections={document} skipConditionalEquipmentCheck={skipConditionalEquipmentCheck} /> : null}
  </Box>
}
