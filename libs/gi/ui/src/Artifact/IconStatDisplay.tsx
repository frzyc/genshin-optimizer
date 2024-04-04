import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/consts'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { artDisplayValue } from '@genshin-optimizer/gi/util'
import type { Palette, TypographyProps } from '@mui/material'
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function IconStatDisplay({
  statKey,
  value,
  color,
  prefix = '',
  typographyProps = {},
}: {
  statKey: MainStatKey | SubstatKey
  value: number
  color?: keyof Palette
  prefix?: string
  typographyProps?: TypographyProps
}) {
  const { t: tk } = useTranslation('statKey_gen')
  const unit = getUnitStr(statKey)
  const valueStr = artDisplayValue(value, unit)
  return (
    <Typography
      key={statKey}
      color={color ? `${color}.main` : undefined}
      {...typographyProps}
    >
      <StatIcon statKey={statKey} iconProps={iconInlineProps} /> {tk(statKey)}{' '}
      <strong>{`${prefix}${valueStr}${unit}`}</strong>
    </Typography>
  )
}
