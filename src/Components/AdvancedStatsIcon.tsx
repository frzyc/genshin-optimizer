import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCdReduction, faCdReductionPrimary, faCdReductionSecondary, faCritRate, faEnergyRecharge, faEnergyRechargePrimary, faEnergyRechargeSecondary, faHealingBonus, faShieldStrength } from "../faIcons";

// single path CdReduction
export function CdReduction({ noColor = false }) {
	return <FontAwesomeIcon icon={faCdReduction as any} className={noColor ? "" : "text-cdReduction"} />
}
// end

// stacked path CdReduction UNIMPLEMENTED
export function CdReductionPrimary({ noColor = false }) {
	return <FontAwesomeIcon icon={faCdReductionPrimary as any} className={noColor ? "" : "text-cdReductionPrimary"} />
}

export function CdReductionSecondary({ noColor = false }) {
	return <FontAwesomeIcon icon={faCdReductionSecondary as any} className={noColor ? "" : "text-cdReductionSecondary"} />
}
// end

export function CritRate({ noColor = false }) {
	return <FontAwesomeIcon icon={faCritRate as any} className={noColor ? "" : "text-critRate"} />
}

// single path EnergyRecharge
export function EnergyRecharge({ noColor = false }) {
	return <FontAwesomeIcon icon={faEnergyRecharge as any} className={noColor ? "" : "text-energyRecharge"} />
}
// end

// stacked path EnergyRecharge UNIMPLEMENTED
export function EnergyRechargePrimary({ noColor = false }) {
	return <FontAwesomeIcon icon={faEnergyRechargePrimary as any} className={noColor ? "" : "text-energyRechargePrimary"} />
}

export function EnergyRechargeSecondary({ noColor = false }) {
	return <FontAwesomeIcon icon={faEnergyRechargeSecondary as any} className={noColor ? "" : "text-energyRechargeSecondary"} />
}
// end

export function HealingBonus({ noColor = false }) {
	return <FontAwesomeIcon icon={faHealingBonus as any} className={noColor ? "" : "text-healingBonus"} />
}

export function ShieldStrength({ noColor = false }) {
	return <FontAwesomeIcon icon={faShieldStrength as any} className={noColor ? "" : "text-shieldStrength"} />
}

const AdvancedStatsIcon = {
	cdReduction: <CdReduction />,
	cdReductionPrimary: <CdReductionPrimary />,
	cdReductionSecondary: <CdReductionSecondary />,
	critRate: <CritRate />,
	energyRecharge: <EnergyRecharge />,
	energyRechargePrimary: <EnergyRechargePrimary />,
	energyRechargeSecondary: <EnergyRechargeSecondary />,
	healingBonus: <HealingBonus />,
	shieldStrength: <ShieldStrength />,

}
export const AdvancedStatsIconComponent = {
	cdReduction: CdReduction,
	cdReductionPrimary: CdReductionPrimary,
	cdReductionSecondary: CdReductionSecondary,
	critRate: CritRate,
	energyRecharge: EnergyRecharge,
	energyRechargePrimary: EnergyRechargePrimary,
	energyRechargeSecondary: EnergyRechargeSecondary,
	healingBonus: HealingBonus,
	shieldStrength: ShieldStrength,

}
export default AdvancedStatsIcon