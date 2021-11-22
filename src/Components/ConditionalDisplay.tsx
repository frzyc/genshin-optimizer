import { CardContent, Box, CardHeader, Divider } from "@mui/material"
import { useCallback, useMemo } from "react"
import Conditional from "../Conditional/Conditional"
import ConditionalSelector from "../Conditional/ConditionalSelector"
import IConditional, { IConditionalValue, IConditionalValues } from "../Types/IConditional"
import { ICalculatedStats } from "../Types/stats"
import statsToFields from "../Util/FieldUtil"
import { deletePropPath, evalIfFunc, layeredAssignment, objClearEmpties } from "../Util/Util"
import CardDark from "./Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"

type ConditionalDisplayProps = {
  conditional: IConditional,
  stats: ICalculatedStats,
  hideHeader?: boolean,
  hideDesc?: boolean,
  onChange: (value: IConditionalValues<IConditionalValue>) => void
  skipConditionalEquipmentCheck?: boolean
}

export default function ConditionalDisplay({ conditional, stats, hideHeader = false, hideDesc = false, onChange, skipConditionalEquipmentCheck = false }: ConditionalDisplayProps) {
  const canShow = useMemo(() => Conditional.canShow(conditional, stats, skipConditionalEquipmentCheck), [conditional, stats, skipConditionalEquipmentCheck])
  const { stats: conditionalStats = {}, fields: conditionalFields = [], conditionalValue } = useMemo(() => canShow ? Conditional.resolve(conditional, stats, undefined) : { stats: {}, fields: [], conditionalValue: [0] as IConditionalValue }, [canShow, conditional, stats])
  const displayFields = useMemo(() => canShow ? [...statsToFields(conditionalStats, stats), ...conditionalFields] : [], [canShow, conditionalStats, stats, conditionalFields])
  const setConditional = useCallback(condV => {
    const [conditionalNum = 0] = condV
    if (!conditionalNum) {
      deletePropPath(stats.conditionalValues, conditional!.keys)
      objClearEmpties(stats.conditionalValues)
    } else if (conditional.keys)
      layeredAssignment(stats.conditionalValues, conditional!.keys, condV)
    onChange(stats.conditionalValues)
  }, [conditional, stats, onChange])

  const description = !hideDesc && conditional.description && evalIfFunc(conditional.description, stats)

  if (!canShow || !stats) return null
  return <CardDark>
    {!hideHeader && conditional.header && <CardHeader avatar={conditional.header.icon && evalIfFunc(conditional.header.icon, stats)} title={conditional.header.title} action={conditional.header.action} titleTypographyProps={{ variant: "subtitle2" }} />}
    {!hideHeader && conditional.header && <Divider />}
    {!!conditional.name && <CardContent>
      {description && <Box mb={1}>{description}</Box>}
      <ConditionalSelector
        conditional={conditional}
        conditionalValue={conditionalValue}
        setConditional={setConditional}
        name={conditional.name}
        stats={stats} />
    </CardContent>}
    <FieldDisplayList sx={{ m: 0 }}>
      {displayFields.map((field, i) => <FieldDisplay key={i} field={field} />)}
    </FieldDisplayList>
  </CardDark>
}