import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Stat from "../Stat"

//small helper component to help display calculated values in description text
/**
 * @deprecated all these values can to be optimizable targets. However, this component cannot be inserted into datamined strings, which will be the new format.
 */
export default function DisplayPercent(percent: number, stats, statKey, fixed = 0) {
  if (!percent || !stats || !statKey) return null
  let variant = Stat.getStatVariant(statKey) || "success"
  let value = (percent / 100) * (stats[statKey] || 0)
  let tooltipElement = <span className={`text-${variant}`}>{value?.toFixed?.(fixed) || value}</span>
  let tooltip = <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="p-tooltip">{percent}% {Stat.getStatNamePretty(statKey)}</Tooltip>}
  >{tooltipElement}</OverlayTrigger>
  return <span>({tooltip})</span>
}