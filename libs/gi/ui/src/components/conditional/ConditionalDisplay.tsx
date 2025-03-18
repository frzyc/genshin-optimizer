import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import type {
  DocumentConditional,
  DocumentSection,
  IFieldDisplay,
} from '@genshin-optimizer/gi/sheets'
import { CardContent } from '@mui/material'
import { useContext } from 'react'
import { DataContext } from '../../context'
import { HeaderDisplay } from '../DocumentDisplay'
import { FieldsDisplay } from '../FieldDisplay'
import { ConditionalSelector } from './ConditionalSelector'

type ConditionalDisplayProps = {
  conditional: DocumentConditional
  hideHeader?: boolean | ((section: DocumentSection) => boolean)
  hideDesc?: boolean
  disabled?: boolean
  bgt?: CardBackgroundColor
}

export function ConditionalDisplay({
  conditional,
  hideHeader = false,
  hideDesc = false,
  disabled = false,
  bgt = 'normal',
}: ConditionalDisplayProps) {
  const { data } = useContext(DataContext)
  const { teamId } = useContext(TeamCharacterContext)
  if (!data) return null
  if (!teamId) return null
  let fields: IFieldDisplay[] | undefined | false | ''
  if ('path' in conditional) {
    const condVal = data.get(conditional.value).value
    const condStates = evalIfFunc(conditional.states, data)
    fields = condVal && condStates[condVal]?.fields
  } /* if ("path" in Object.entries(conditional.states)[0]) */ else {
    const condStates = evalIfFunc(conditional.states, data)
    fields = Object.values(condStates).flatMap((state) => {
      const stateVal = data.get(state.value).value
      return stateVal ? state.fields : []
    })
  }
  return (
    <CardThemed bgt={bgt}>
      {!evalIfFunc(hideHeader, conditional) && (
        <HeaderDisplay header={conditional.header} hideDesc={hideDesc} />
      )}
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <ConditionalSelector conditional={conditional} disabled={disabled} />
      </CardContent>
      {fields && <FieldsDisplay bgt={bgt} fields={fields} />}
    </CardThemed>
  )
}
