import { Badge } from 'react-bootstrap';

export default function PercentBadge(props) {
  let { percent, valid, children } = props
  let badgeColor = !valid ? "danger" : (isNaN(percent) ? "secondary" : `${Math.floor(percent * 0.05) + 1}roll`)
  return <Badge variant={badgeColor} className={badgeColor === "secondary" ? "" : "text-darkcontent"}>{children}</Badge>
}
