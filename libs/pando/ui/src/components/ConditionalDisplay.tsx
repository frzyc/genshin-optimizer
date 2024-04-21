import type { ConditionalDocument } from '@genshin-optimizer/pando/ui-sheet'
import { Button, Typography } from '@mui/material'
// TODO: Move this type to a pando lib
// TODO: Create some context that specifies if we should use gi or sr data.
// Then also create a helper function that will pull the correct calc context depending on what is specified
import type { Tag } from '@genshin-optimizer/pando/engine'
import { convert, selfTag } from '@genshin-optimizer/sr/formula'
import { useCalcContext } from '@genshin-optimizer/sr/ui'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'

export type SetCondCallback = (
  src: string,
  name: string,
  value: string | number
) => void

export function ConditionalDisplay({
  condDoc,
  setCond,
}: {
  condDoc: ConditionalDocument
  setCond: SetCondCallback
}) {
  return (
    <>
      <Typography component="pre">
        {JSON.stringify(condDoc, undefined, 2)}
      </Typography>
      <BoolConditionalDisplay
        cond={condDoc.conditional.tag}
        setCond={setCond}
      />
    </>
  )
}

function BoolConditionalDisplay({
  cond,
  setCond,
}: {
  cond: Tag
  setCond: SetCondCallback
}) {
  const { calc } = useCalcContext()
  const member0 = convert(selfTag, {
    member: 'member0',
    et: 'self',
  })
  const conditionalValue = calc?.compute(member0.withTag(cond)).val
  const src = cond['src']
  const name = cond['q']
  if (!name || !src)
    throw new Error(
      `q or src not specified for conditional tag: ${JSON.stringify(cond)}`
    )
  return (
    <Typography>
      <Button
        variant="outlined"
        color={conditionalValue ? 'success' : 'primary'}
        onClick={() => setCond(src, name, conditionalValue ? 0 : 1)}
        startIcon={conditionalValue ? <CheckBox /> : <CheckBoxOutlineBlank />}
      >
        {JSON.stringify(cond)}
      </Button>
    </Typography>
  )
}
