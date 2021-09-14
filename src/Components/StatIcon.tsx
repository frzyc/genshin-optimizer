import { faDiceD20 } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnemo, faAtk, faCdReductionPrimary, faCdReductionSecondary, faCritRate, faCryo, faDef, faDendro, faElectro, faElementalMastery, faEnergyRechargePrimary, faEnergyRechargeSecondary, faGeo, faHealingBonus, faHpPrimary, faHpSecondary, faHydro, faMaxStamina, faPhysicalDmgBonus, faPyro, faShieldStrength } from '../faIcons'
import { objectFromKeyMap } from '../Util/Util'

export function HPIcon() {
	return <span className="fa-layers ">
		<FontAwesomeIcon icon={faHpPrimary as any} />
		<FontAwesomeIcon icon={faHpSecondary as any} style={{ color: "grey" }} />
	</span>
}

export function CdRedIcon() {
	return <span className="fa-layers ">
		<FontAwesomeIcon icon={faCdReductionPrimary as any} />
		<FontAwesomeIcon icon={faCdReductionSecondary as any} style={{ color: "grey" }} />
	</span>
}

export function EnerRechIcon() {
	return <span className="fa-layers ">
		<FontAwesomeIcon icon={faEnergyRechargePrimary as any} />
		<FontAwesomeIcon icon={faEnergyRechargeSecondary as any} style={{ color: "grey" }} />
	</span>
}
export const uncoloredEleIcons = {
	anemo: <FontAwesomeIcon icon={faAnemo as any} />,
	geo: <FontAwesomeIcon icon={faGeo as any} />,
	electro: <FontAwesomeIcon icon={faElectro as any} />,
	hydro: <FontAwesomeIcon icon={faHydro as any} />,
	pyro: <FontAwesomeIcon icon={faPyro as any} />,
	cryo: <FontAwesomeIcon icon={faCryo as any} />,
	dendro: <FontAwesomeIcon icon={faDendro as any} />,
	physical: <FontAwesomeIcon icon={faPhysicalDmgBonus as any} />,
} as const
const coloredEleIcon = objectFromKeyMap(Object.keys(uncoloredEleIcons), key => <span className={`text-${key}`}>{uncoloredEleIcons[key]}</span>)

const StatIcon = {
	characterHP: <HPIcon />,
	finalHP: <HPIcon />,
	hp_: <HPIcon />,
	hp: <HPIcon />,

	baseATK: <FontAwesomeIcon icon={faAtk as any} />,
	characterATK: <FontAwesomeIcon icon={faAtk as any} />,
	finalATK: <FontAwesomeIcon icon={faAtk as any} />,
	atk_: <FontAwesomeIcon icon={faAtk as any} />,
	atk: <FontAwesomeIcon icon={faAtk as any} />,

	characterDEF: <FontAwesomeIcon icon={faDef as any} />,
	finalDEF: <FontAwesomeIcon icon={faDef as any} />,
	def_: <FontAwesomeIcon icon={faDef as any} />,
	def: <FontAwesomeIcon icon={faDef as any} />,

	eleMas: <FontAwesomeIcon icon={faElementalMastery as any} />,
	critRate_: <FontAwesomeIcon icon={faCritRate as any} />,
	critDMG_: <FontAwesomeIcon icon={faDiceD20 as any} />,
	enerRech_: <EnerRechIcon />,
	heal_: <FontAwesomeIcon icon={faHealingBonus as any} />,

	cdRed_: <CdRedIcon />,

	shield_: <FontAwesomeIcon icon={faShieldStrength as any} />,
	stamina: <FontAwesomeIcon icon={faMaxStamina as any} />,

	...coloredEleIcon,
	...Object.fromEntries(Object.keys(coloredEleIcon).flatMap(ele => [[`${ele}_dmg_`, coloredEleIcon[ele]], [`${ele}_res_`, coloredEleIcon[ele]]]))
}

export default StatIcon