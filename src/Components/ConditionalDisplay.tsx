import { Box, CardContent, CardHeader, Divider, ListItem } from "@mui/material"
import { useContext } from "react"
import ConditionalSelector from "../Conditional/ConditionalSelector"
import { DataContext, dataContextObj } from "../DataContext"
import IConditional from "../Types/IConditional_WR"
import { evalIfFunc } from "../Util/Util"
import CardDark from "./Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "./FieldDisplay"
import { data as dataNode } from '../Formula/utils'
import { Data } from "../Formula/type"

type ConditionalDisplayProps = {
  conditional: IConditional,
  hideHeader?: boolean,
  hideDesc?: boolean,
  fieldContext?: dataContextObj
}

export default function ConditionalDisplay({ conditional, hideHeader = false, hideDesc = false, fieldContext }: ConditionalDisplayProps) {
  const dataContext = useContext(DataContext)
  const { data } = dataContext
  // TODO: as Data
  const canShow = conditional.canShow ? !(fieldContext ? data.get(dataNode(conditional.canShow, { target: fieldContext.data.data[0] } as Data)).isEmpty : data.get(conditional.canShow).isEmpty) : true
  if (!canShow) return null
  const condVal = data.get(conditional.value).value

  const description = !hideDesc && evalIfFunc(conditional.description, data)
  let { icon, title, action } = conditional.header ?? {}
  icon = evalIfFunc(icon, data)
  const fields = condVal && conditional.states[condVal]?.fields

  return <CardDark>
    {!hideHeader && conditional.header && <CardHeader avatar={icon} title={title} action={action} titleTypographyProps={{ variant: "subtitle2" }} />}
    {!hideHeader && conditional.header && <Divider />}
    {!!conditional.name && <CardContent>
      {description && <Box mb={1}>{description}</Box>}
      <ConditionalSelector
        conditional={conditional}
        conditionalValue={condVal} />
    </CardContent>}
    {fields &&
      <FieldDisplayList sx={{ m: 0 }}>
        {fields.map((field, i) => <ListItem key={i}><FieldDisplay field={field} fieldContext={fieldContext} /></ListItem>)}
      </FieldDisplayList>
    }
  </CardDark>
}
