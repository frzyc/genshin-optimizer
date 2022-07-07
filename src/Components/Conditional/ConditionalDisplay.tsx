import { CardContent } from "@mui/material"
import { useContext } from "react"
import { DataContext } from "../../Context/DataContext"
import { DocumentConditional, DocumentSection } from "../../Types/sheet"
import { evalIfFunc } from "../../Util/Util"
import CardDark from "../Card/CardDark"
import { HeaderDisplay } from "../DocumentDisplay"
import FieldsDisplay from "../FieldDisplay"
import ConditionalSelector from "./ConditionalSelector"

type ConditionalDisplayProps = {
  conditional: DocumentConditional,
  hideHeader?: boolean | ((section: DocumentSection) => boolean),
  hideDesc?: boolean,
}

export default function ConditionalDisplay({ conditional, hideHeader = false, hideDesc = false }: ConditionalDisplayProps) {
  const { data } = useContext(DataContext)
  let fields
  if ("path" in conditional) {
    const condVal = data.get(conditional.value).value
    fields = condVal && conditional.states[condVal]?.fields
  } else /* if ("path" in Object.entries(conditional.states)[0]) */ {
    fields = Object.values(conditional.states).flatMap(state => {
      const stateVal = data.get(state.value).value
      return stateVal ? state.fields : []
    })
  }
  return <CardDark>
    {!evalIfFunc(hideHeader, conditional) && <HeaderDisplay header={conditional.header} hideDesc={hideDesc} />}
    <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
      <ConditionalSelector conditional={conditional} />
    </CardContent>
    {fields && <FieldsDisplay fields={fields} />}
  </CardDark>
}
