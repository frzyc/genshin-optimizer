import { Badge, Card, ListGroup } from "react-bootstrap"
import DocumentDisplay from "../../Components/DocumentDisplay"
import FieldDisplay from "../../Components/FieldDisplay"
import { ArtifactSetKey, SetNum } from "../../Types/consts"
import { ICalculatedStats } from "../../Types/stats"
import statsToFields from "../../Util/FieldUtil"
import { usePromise } from "../../Util/ReactUtil"
import { ArtifactSheet } from "../ArtifactSheet"

type Data = {
  setKey: ArtifactSetKey,
  setNumKey: SetNum,
  newBuild?: ICalculatedStats,
  equippedBuild?: ICalculatedStats
  characterDispatch: (arg0: any) => void,
}

export default function SetEffectDisplay({ setKey, setNumKey, equippedBuild, newBuild, characterDispatch }: Data) {
  const sheet = usePromise(ArtifactSheet.get(setKey), [setKey])
  if (!sheet) return null

  const stats = newBuild ?? equippedBuild!
  const setEffectText = sheet.setEffectDesc(setNumKey)
  const setStats = sheet.setNumStats(setNumKey, stats)
  const setStatsFields = statsToFields(setStats, stats)
  const document = sheet.setEffectDocument(setNumKey)
  return <>
    <Card bg="darkcontent" text={"lightfont" as any} className="mb-2 w-100" >
      <Card.Header className="p-2">
        <Badge variant="success">{setNumKey}-Set</Badge> {setEffectText}
      </Card.Header>
      <ListGroup className="text-white" variant="flush">
        {setStatsFields.map((field, i) => <FieldDisplay key={i} index={i} field={field} />)}
      </ListGroup>
    </Card>
    {document ? <DocumentDisplay sections={document} characterDispatch={characterDispatch} /> : null}
  </>
}
