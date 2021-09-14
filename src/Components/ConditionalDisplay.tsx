import { useCallback, useContext, useMemo } from "react"
import { Card, ListGroup } from "react-bootstrap"
import { buildContext } from "../Build/Build"
import Conditional from "../Conditional/Conditional"
import ConditionalSelector from "../Conditional/ConditionalSelector"
import IConditional from "../Types/IConditional"
import statsToFields from "../Util/FieldUtil"
import { deletePropPath, layeredAssignment, objClearEmpties } from "../Util/Util"
import FieldDisplay from "./FieldDisplay"
type ConditionalDisplayProps = {
  conditional: IConditional,
  characterDispatch: (any) => void,//TODO: characterDispatch type
  fieldClassName?: string
}

export default function ConditionalDisplay({ conditional, characterDispatch, fieldClassName }: ConditionalDisplayProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const stats = newBuild ? newBuild : equippedBuild
  const canShow = useMemo(() => Conditional.canShow(conditional, stats), [conditional, stats])
  const { stats: conditionalStats = {}, fields: conditionalFields = [], conditionalValue } = useMemo(() => canShow && Conditional.resolve(conditional, stats, undefined), [canShow, conditional, stats])
  const displayFields = useMemo(() => canShow && [...statsToFields(conditionalStats, stats), ...conditionalFields], [canShow, conditionalStats, stats, conditionalFields])
  const setConditional = useCallback(condV => {
    if (!stats) return
    const [conditionalNum = 0] = condV
    if (!conditionalNum) {
      deletePropPath(stats.conditionalValues, conditional!.keys)
      objClearEmpties(stats.conditionalValues)
    } else if (conditional.keys)
      layeredAssignment(stats.conditionalValues, conditional!.keys, condV)
    characterDispatch({ conditionalValues: stats.conditionalValues })
  }, [conditional, stats, characterDispatch])

  if (!canShow || !stats) return null
  return <Card bg="darkcontent" text={"lightfont" as any} className="mb-2 w-100">
    <Card.Header className="p-2">
      <ConditionalSelector
        conditional={conditional}
        conditionalValue={conditionalValue}
        setConditional={setConditional}
        name={conditional.name}
        stats={stats} />
    </Card.Header>
    <ListGroup className="text-white" variant="flush">
      {displayFields.map((field, i) => <FieldDisplay key={i} index={i} field={field} className={fieldClassName} />)}
    </ListGroup>
  </Card>
}