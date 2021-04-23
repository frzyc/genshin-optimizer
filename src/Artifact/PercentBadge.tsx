import { Badge } from 'react-bootstrap';

export default function PercentBadge({ value, valid }: Data) {
  let [badgeColor, text] = typeof value === 'number' ?
    [`${Math.floor(value * 0.05) + 1}roll`, value.toFixed(2) + "%"] : ["secondary", value]
  if (!valid) badgeColor = "danger"
  return <Badge variant={badgeColor} className={badgeColor === "secondary" ? "" : "text-darkcontent"}>{text}</Badge>
}

type Data = {
  valid: boolean,
  value: number | string,
}
