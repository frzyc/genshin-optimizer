import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhysicalDmgBonus } from "../faIcons";

export function PhysicalDmgBonus({ noColor = false }) {
	return <FontAwesomeIcon icon={faPhysicalDmgBonus as any} className={noColor ? "" : "text-physicalDmgBonus"} />
}
const DmgBonusIcon = {
	physicalDmgBonus: <PhysicalDmgBonus />,
}
export const DmgBonusIconComponent = {
	physicalDmgBonus: PhysicalDmgBonus,
}
export default DmgBonusIcon