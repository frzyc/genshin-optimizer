import { SqBadge } from '@genshin-optimizer/ui-common'
import { clamp } from '@genshin-optimizer/util'
import type { ButtonProps } from '@mui/material'
import type { RollColorKey } from './util'

export function PercentBadge({
  value,
  max = 1,
  valid,
}: {
  valid?: boolean
  value: number | string
  max?: number
}) {
  const [badgeColor, text]: [color: ButtonProps['color'], text: string] =
    typeof value === 'number'
      ? [
          `roll${clamp(
            Math.floor((value / max) * 10) - 4,
            1,
            6
          )}` as RollColorKey,
          (value * 100).toFixed() + '%',
        ]
      : ['secondary', value]
  return <SqBadge color={valid ? badgeColor : 'error'}>{text}</SqBadge>
}
