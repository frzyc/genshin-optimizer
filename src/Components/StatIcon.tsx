import { faDiceD20 } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { allElements } from '../Types/consts'

// Elements
import { faAnemo, faGeo, faElectro, faHydro, faPyro, faCryo } from '../faIcons'

// Base Stats
import { faAtk, faDef, faElementalMastery, faMaxHpPrimary } from '../faIcons'

// Advanced Stats
import { faCritRate, faEnergyRechargePrimary, faHealingBonus } from '../faIcons'

const elefamap = {
	anemo: faAnemo,
	geo: faGeo,
	electro: faElectro,
	hydro: faHydro,
	pyro: faPyro,
	cryo: faCryo,
}
const StatIcon = {
	characterHP: faMaxHpPrimary,
	finalHP: faMaxHpPrimary,
	hp_: faMaxHpPrimary,
	hp: faMaxHpPrimary,

	baseATK: faAtk,
	characterATK: faAtk,
	finalATK: faAtk,
	atk_: faAtk,
	atk: faAtk,

	characterDEF: faDef,
	finalDEF: faDef,
	def_: faDef,
	def: faDef,

	eleMas: faElementalMastery,
	critRate_: faCritRate,
	critDMG_: faDiceD20,
	enerRech_: faEnergyRechargePrimary,
	heal_: faHealingBonus,

	...Object.fromEntries(allElements.flatMap(ele => [[`${ele}_dmg_`, elefamap[ele]], [`${ele}_res_`, elefamap[ele]]]))
}

const StatIconEle = (statKey) =>
	StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null

export default StatIcon

export {
	StatIconEle
}