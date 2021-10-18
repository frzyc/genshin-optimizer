import SqBadge from '../Components/SqBadge';
import { clamp } from '../Util/Util';

export default function PercentBadge({ value, valid }: Data) {
  let [badgeColor, text] = typeof value === 'number' ?
    [`roll${clamp(Math.floor(value * 0.05) + 1, 1, 6)}`, value.toFixed(2) + "%"] : ["secondary", value]
  if (!valid) badgeColor = "error"
  return <SqBadge color={badgeColor} >{text}</SqBadge>
}

type Data = {
  valid: boolean,
  value: number | string,
}
