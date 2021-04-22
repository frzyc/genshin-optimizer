import { Badge } from 'react-bootstrap';

export default function PercentBadge({ value, valid }: Data) {
  const [badgeColor, text] = typeof value === 'number' ?
    [valid ? `${Math.floor(value * 0.05) + 1}roll` : "danger", value.toFixed(2) + "%"] :
    ["secondary", value]
  return <Badge variant={badgeColor} className={badgeColor === "secondary" ? "" : "text-darkcontent"}>{text}</Badge>
}

type Data = {
  valid: boolean,
  value: number | string,
}
