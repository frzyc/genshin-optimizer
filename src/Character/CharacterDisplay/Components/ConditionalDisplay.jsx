import { useCallback, useMemo } from "react"
import { Card, ListGroup } from "react-bootstrap"
import Conditional from "../../../Conditional/Conditional"
import ConditionalSelector from "../../../Conditional/ConditionalSelector"
import { deletePropPath, layeredAssignment, objClearEmpties } from "../../../Util/Util"
import statsToFields from "../statsToFields"
import FieldDisplay from "./FieldDisplay"

export default function ConditionalDisplay({ conditional, titleText = null, equippedBuild, newBuild, characterDispatch, editable, fieldClassName, initialFields = [] }) {
  const stats = newBuild ? newBuild : equippedBuild
  const { stats: conditionalStats = {}, fields: conditionalFields = [], conditionalValue } = useMemo(() => Conditional.resolve(conditional, stats), [conditional, stats])
  const setConditional = useCallback(condV => {
    const [conditionalNum = 0] = condV
    if (!conditionalNum) {
      deletePropPath(stats.conditionalValues, conditional.keys)
      objClearEmpties(stats.conditionalValues)
    } else layeredAssignment(stats.conditionalValues, conditional.keys, condV)
    characterDispatch({ conditionalValues: stats.conditionalValues })
  }, [stats.conditionalValues, conditional.keys, characterDispatch])
  const displayFields = useMemo(() => [...initialFields, ...statsToFields(conditionalStats, stats), ...conditionalFields], [initialFields, conditionalStats, stats, conditionalFields])
  if (!conditional || !Conditional.canShow(conditional, stats)) return null
  return <Card bg="darkcontent" text="lightfont" className="mb-2 w-100">
    <Card.Header className="p-2">
      <ConditionalSelector disabled={!editable}
        conditional={conditional}
        conditionalValue={conditionalValue}
        setConditional={setConditional}
        name={<span>{conditional.name}</span>} /> {titleText}
    </Card.Header>
    <ListGroup className="text-white" variant="flush">
      {displayFields.map((field, i) => <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild, className: fieldClassName }} />)}
    </ListGroup>
  </Card>
}