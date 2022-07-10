import SqBadge from './SqBadge';
import { clamp } from '../Util/Util';

export default function PercentBadge({ value, max = 1, valid }: {
  valid?: boolean,
  value: number | string,
  max?: number
}) {
  let [badgeColor, text] = typeof value === 'number' ?
    [`roll${clamp(Math.floor((value / max) * 10) - 4, 1, 6)}`, value.toFixed() + "%"] : ["secondary", value]
  if (value > max) valid = false
  if (!valid) badgeColor = "error"
  return <SqBadge color={badgeColor} >{text}</SqBadge>
}
