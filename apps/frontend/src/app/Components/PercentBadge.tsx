import { clamp } from '@genshin-optimizer/common/util'
import type { ButtonProps } from '@mui/material'
import type { RollColorKey } from '../Types/consts'
import SqBadge from './SqBadge'

export default function PercentBadge({
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
          value.toFixed() + '%',
        ]
      : ['secondary', value]
  return <SqBadge color={valid ? badgeColor : 'error'}>{text}</SqBadge>
}
