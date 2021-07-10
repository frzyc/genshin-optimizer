import { useCallback, useMemo } from "react"
import { Card, ListGroup } from "react-bootstrap"
import Conditional from "../Conditional/Conditional"
import ConditionalSelector from "../Conditional/ConditionalSelector"
import ICalculatedStats from "../Types/ICalculatedStats"
import IConditional from "../Types/IConditional"
import statsToFields from "../Util/FieldUtil"
import { deletePropPath, layeredAssignment, objClearEmpties } from "../Util/Util"
import FieldDisplay from "./FieldDisplay"
type ConditionalDisplayProps = {
  conditional: IConditional,
  equippedBuild?: ICalculatedStats,
  newBuild?: ICalculatedStats,
  characterDispatch: (any) => void,//TODO: characterDispatch type
  editable: boolean,
  fieldClassName?: string
}

export default function ConditionalDisplay({ conditional, equippedBuild, newBuild, characterDispatch, editable, fieldClassName }: ConditionalDisplayProps) {
  const stats = newBuild ? newBuild : equippedBuild
  if (!stats) debugger
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
      <ConditionalSelector disabled={!editable}
        conditional={conditional}
        conditionalValue={conditionalValue}
        setConditional={setConditional}
        name={conditional.name}
        stats={stats} />
    </Card.Header>
    <ListGroup className="text-white" variant="flush">
      {displayFields.map((field, i) => <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild, className: fieldClassName }} />)}
    </ListGroup>
  </Card>
}