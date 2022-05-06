import { CardContent } from "@mui/material"
import { useContext } from "react"
import { DataContext } from "../../DataContext"
import { DocumentSection, IDocumentConditional } from "../../Types/sheet"
import { evalIfFunc } from "../../Util/Util"
import CardDark from "../Card/CardDark"
import { HeaderDisplay } from "../DocumentDisplay"
import FieldsDisplay from "../FieldDisplay"
import ConditionalSelector from "./ConditionalSelector"

type ConditionalDisplayProps = {
  conditional: IDocumentConditional,
  hideHeader?: boolean | ((section: DocumentSection) => boolean),
  hideDesc?: boolean,
}

export default function ConditionalDisplay({ conditional, hideHeader = false, hideDesc = false }: ConditionalDisplayProps) {
  const { data } = useContext(DataContext)
  const condVal = data.get(conditional.value).value

  const fields = condVal && conditional.states[condVal]?.fields
  return <CardDark>
    {!evalIfFunc(hideHeader, conditional) && <HeaderDisplay header={conditional.header} hideDesc={hideDesc} />}
    {!!conditional.name && <CardContent>
      <ConditionalSelector
        conditional={conditional}
        conditionalValue={condVal} />
    </CardContent>}
    {fields && <FieldsDisplay fields={fields} />}
  </CardDark>
}
