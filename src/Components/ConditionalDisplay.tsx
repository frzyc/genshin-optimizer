import { CardContent } from "@mui/material"
import { useCallback, useContext, useMemo } from "react"
import { buildContext } from "../Build/Build"
import Conditional from "../Conditional/Conditional"
import ConditionalSelector from "../Conditional/ConditionalSelector"
import useCharacterReducer from "../ReactHooks/useCharacterReducer"
import { CharacterKey } from "../Types/consts"
import IConditional from "../Types/IConditional"
import statsToFields from "../Util/FieldUtil"
import { deletePropPath, layeredAssignment, objClearEmpties } from "../Util/Util"
import CardDark from "./Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

type ConditionalDisplayProps = {
  conditional: IConditional,
  characterKey: CharacterKey
}

export default function ConditionalDisplay({ conditional, characterKey }: ConditionalDisplayProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const characterDispatch = useCharacterReducer(characterKey)
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
  return <CardDark>
    <CardContent>
      <ConditionalSelector
        conditional={conditional}
        conditionalValue={conditionalValue}
        setConditional={setConditional}
        name={conditional.name}
        stats={stats} />
    </CardContent>
    <FieldDisplayList sx={{ m: 0 }}>
      {displayFields.map((field, i) => <FieldDisplay key={i} field={field} />)}
    </FieldDisplayList>
  </CardDark>
}