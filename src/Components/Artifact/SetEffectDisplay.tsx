import { Box } from "@mui/material"
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactSetKey, SetNum } from "../../Types/consts"
import DocumentDisplay from "../DocumentDisplay"

type Data = {
  setKey: ArtifactSetKey,
  setNumKey: SetNum,
  hideHeader?: boolean,
  conditionalsOnly?: boolean
}

export default function SetEffectDisplay({ setKey, setNumKey, hideHeader = false, conditionalsOnly = false }: Data) {
  const sheet = usePromise(() => ArtifactSheet.get(setKey), [setKey])
  if (!sheet) return null

  const document = conditionalsOnly ? sheet.setEffectDocument(setNumKey)?.filter(section => "states" in section) : sheet.setEffectDocument(setNumKey)
  return <Box display="flex" flexDirection="column">
    {document ? <DocumentDisplay sections={document} hideHeader={hideHeader} /> : null}
  </Box>
}
