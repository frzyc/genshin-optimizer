import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAtk, faDef, faElementalMastery, faMaxHp, faMaxHpPrimary, faMaxHpSecondary, faMaxStamina } from "../faIcons";

export function Atk({ noColor = false }) {
	return <FontAwesomeIcon icon={faAtk as any} className={noColor ? "" : "text-atk"} />
}

export function Def({ noColor = false }) {
	return <FontAwesomeIcon icon={faDef as any} className={noColor ? "" : "text-def"} />
}

export function ElementalMastery({ noColor = false }) {
	return <FontAwesomeIcon icon={faElementalMastery as any} className={noColor ? "" : "text-elementalMastry"} />
}

// single path MaxHp
export function MaxHp({ noColor = false }) {
	return <FontAwesomeIcon icon={faMaxHp as any} className={noColor ? "" : "text-maxHp"} />
}
// end

// stacked path MaxHp UNIMPLEMENTED
export function MaxHpPrimary({ noColor = false }) {
	return <FontAwesomeIcon icon={faMaxHpPrimary as any} className={noColor ? "" : "text-maxHpPrimary"} />
}

export function MaxHpSecondary({ noColor = false }) {
	return <FontAwesomeIcon icon={faMaxHpSecondary as any} className={noColor ? "" : "text-maxHpSecondary"} />
}
// end

export function MaxStamina({ noColor = false }) {
	return <FontAwesomeIcon icon={faMaxStamina as any} className={noColor ? "" : "text-maxStamina"} />
}

const BaseStatsIcon = {
	atk: <Atk />,
	def: <Def />,
	elementalMastry: <ElementalMastery />,
	maxHp: <MaxHp />,
	maxHpPrimary: <MaxHpPrimary />,
	maxHpSecondary: <MaxHpSecondary />,
	maxStamina: <MaxStamina />,
}
export const BaseStatsIconComponent = {
	atk: Atk,
	def: Def,
	elementalMastry: ElementalMastery,
	maxHp: MaxHp,
	maxHpPrimary: MaxHpPrimary,
	maxHpSecondary: MaxHpSecondary,
	maxStamina: MaxStamina,
}
export default BaseStatsIcon