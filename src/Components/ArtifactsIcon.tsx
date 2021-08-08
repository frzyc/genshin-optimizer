import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclet, faFlower, faGoblet, faPlume, faSands } from "../faIcons";

export function Circlet({ noColor = false }) {
	return <FontAwesomeIcon icon={faCirclet as any} className={noColor ? "" : "text-circlet"} />
}

export function Flower({ noColor = false }) {
	return <FontAwesomeIcon icon={faFlower as any} className={noColor ? "" : "text-flower"} />
}

export function Goblet({ noColor = false }) {
	return <FontAwesomeIcon icon={faGoblet as any} className={noColor ? "" : "text-goblet"} />
}

export function Plume({ noColor = false }) {
	return <FontAwesomeIcon icon={faPlume as any} className={noColor ? "" : "text-plume"} />
}

export function Sands({ noColor = false }) {
	return <FontAwesomeIcon icon={faSands as any} className={noColor ? "" : "text-sands"} />
}

const ArtifactsIcon = {
	circlet: <Circlet />,
	flower: <Flower />,
	goblet: <Goblet />,
	plume: <Plume />,
	sands: <Sands />,
}
export const ArtifactsIconComponent = {
	circlet: Circlet,
	flower: Flower,
	goblet: Goblet,
	plume: Plume,
	sands: Sands,
}
export default ArtifactsIcon