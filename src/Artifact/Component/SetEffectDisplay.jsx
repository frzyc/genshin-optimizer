import { Badge, Card, ListGroup } from "react-bootstrap"
import ConditionalDisplay from "../../Character/CharacterDisplay/Components/ConditionalDisplay"
import FieldDisplay from "../../Character/CharacterDisplay/Components/FieldDisplay"
import statsToFields from "../../Util/FieldUtil"
import Artifact from "../Artifact"

export default function SetEffectDisplay({ setKey, setNumKey, equippedBuild, newBuild, editable, characterDispatch }) {
  const stats = newBuild ? newBuild : equippedBuild
  const setEffectText = Artifact.getSetEffectText(setKey, setNumKey, stats)
  const setStats = Artifact.getArtifactSetNumStats(setKey, setNumKey)
  const setStatsFields = statsToFields(setStats, stats)
  const conditionals = Artifact.getSetEffectConditionals(setKey, setNumKey)
  return <>
    <Card bg="darkcontent" text="lightfont" className="mb-2 w-100" >
      <Card.Header className="p-2">
        <Badge variant="success">{setNumKey}-Set</Badge> {setEffectText}
      </Card.Header>
      <ListGroup className="text-white" variant="flush">
        {setStatsFields.map((field, i) => <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
      </ListGroup>
    </Card>
    {Boolean(conditionals) && Object.entries(conditionals).map(([ckey, conditional]) => <ConditionalDisplay key={ckey} {...{ conditional, equippedBuild, newBuild, characterDispatch, editable }} />)}
  </>
}