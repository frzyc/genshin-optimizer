import { Box, CardContent, Typography } from "@mui/material"
import CardDark from "../../Components/Card/CardDark"
import DocumentDisplay from "../../Components/DocumentDisplay"
import FieldDisplay, { FieldDisplayList } from "../../Components/FieldDisplay"
import SqBadge from "../../Components/SqBadge"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactSetKey, SetNum } from "../../Types/consts"
import { ICalculatedStats } from "../../Types/stats"
import statsToFields from "../../Util/FieldUtil"
import { ArtifactSheet } from "../ArtifactSheet"

type Data = {
  setKey: ArtifactSetKey,
  setNumKey: SetNum,
  newBuild?: ICalculatedStats,
  equippedBuild?: ICalculatedStats
}

export default function SetEffectDisplay({ setKey, setNumKey, equippedBuild, newBuild }: Data) {
  const sheet = usePromise(ArtifactSheet.get(setKey), [setKey])
  if (!sheet) return null

  const stats = newBuild ?? equippedBuild!
  const setEffectText = sheet.setEffectDesc(setNumKey)
  const setStats = sheet.setNumStats(setNumKey, stats)
  const setStatsFields = statsToFields(setStats, stats)
  const document = sheet.setEffectDocument(setNumKey)
  return <Box sx={{
    mt: 1,
    "> div": { mb: 1 },
  }}>
    <CardDark>
      <CardContent>
        <Typography><SqBadge color="success">{setNumKey}-Set</SqBadge> {setEffectText}</Typography>
      </CardContent>
      <FieldDisplayList sx={{ m: 0 }}>
        {setStatsFields.map((field, i) => <FieldDisplay key={i} field={field} />)}
      </FieldDisplayList>
    </CardDark>
    {document ? <DocumentDisplay sections={document} characterKey={stats.characterKey} /> : null}
  </Box>
}
