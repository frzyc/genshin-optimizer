import { CardHeaderCustom } from '@genshin-optimizer/common/ui'
import { Divider } from '@mui/material'
import type { Document, Header } from '../types'

export function HeaderDisplay({
  header,
  hideDivider,
  compact = false,
}: {
  header: Header
  hideDivider?: boolean | ((section: Document) => boolean)
  compact?: boolean
}) {
  const { icon, text: title, additional: action } = header

  return (
    <>
      <CardHeaderCustom
        avatar={icon}
        title={title}
        action={action}
        compact={compact}
      />
      {!hideDivider && <Divider />}
    </>
  )
}
