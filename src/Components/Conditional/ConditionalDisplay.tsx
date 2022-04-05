import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CardContent, CardHeader, Divider, ListItem, Typography } from "@mui/material"
import { useContext } from "react"
import { DataContext, dataContextObj } from "../../DataContext"
import { Data } from "../../Formula/type"
import { data as dataNode } from '../../Formula/utils'
import IConditional from "../../Types/IConditional"
import { evalIfFunc } from "../../Util/Util"
import BootstrapTooltip from "../BootstrapTooltip"
import CardDark from "../Card/CardDark"
import FieldDisplay, { FieldDisplayList } from "../FieldDisplay"
import ConditionalSelector from "./ConditionalSelector"

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
  const canShow = conditional.canShow ? !!(fieldContext ? data.get(dataNode(conditional.canShow, { target: fieldContext.data.data[0] } as Data)).value : data.get(conditional.canShow).value) : true
  if (!canShow) return null
  const condVal = data.get(conditional.value).value

  const description = !hideDesc && evalIfFunc(conditional.description, data)
  let { icon, title, action } = conditional.header ?? {}
  icon = evalIfFunc(icon, data)
  const fields = condVal && conditional.states[condVal]?.fields
  const displayTitle = hideDesc ? title : title && <BootstrapTooltip placement="top" title={<Typography>{description}</Typography>}>
    <span>{title} <FontAwesomeIcon icon={faInfoCircle} /></span>
  </BootstrapTooltip>
  return <CardDark>
    {!hideHeader && conditional.header && <CardHeader avatar={icon} title={displayTitle} action={action} titleTypographyProps={{ variant: "subtitle2" }} />}
    {!hideHeader && conditional.header && <Divider />}
    {!!conditional.name && <CardContent>
      <ConditionalSelector
        conditional={conditional}
        conditionalValue={condVal} />
    </CardContent>}
    {fields &&
      <FieldDisplayList sx={{ m: 0 }}>
        {fields.map((field, i) => <FieldDisplay key={i} field={field} fieldContext={fieldContext} component={ListItem} />)}
      </FieldDisplayList>
    }
  </CardDark>
}
