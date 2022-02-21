import SqBadge from '../Components/SqBadge';
import { clamp } from '../Util/Util';

export default function PercentBadge({ value, max = 1, valid }: {
  valid?: boolean,
  value: number | string,
  max?: number
}) {
  let [badgeColor, text] = typeof value === 'number' ?
    [`roll${clamp(Math.floor((value / max) * 10) - 4, 1, 6)}`, value.toFixed(2) + "%"] : ["secondary", value]
  if (!valid) badgeColor = "error"
  return <SqBadge color={badgeColor} >{text}</SqBadge>
}
