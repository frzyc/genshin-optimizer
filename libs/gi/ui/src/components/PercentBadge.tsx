import { SqBadge } from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import type { ButtonProps } from '@mui/material'
import type { RollColorKey } from './artifact'
/**
 * Note, all inputs should be in decimals, and this component will output percentages.
 * @param param0
 * @returns
 */
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
          `${(value * 100).toFixed()}%`,
        ]
      : ['secondary', value]
  return <SqBadge color={valid ? badgeColor : 'error'}>{text}</SqBadge>
}
