import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnemo, faAtk, faCdReduction, faCritDmg, faCritRate, faCryo, faDef, faDendro, faElectro, faElementalMastery, faEnergyRecharge, faGeo, faHealingAdd, faHealingBonus, faHp, faHydro, faMaxStamina, faPhysicalDmgBonus, faPyro, faShieldStrength } from './faIcons'
export const elementSvg = {
  anemo: faAnemo,
  geo: faGeo,
  electro: faElectro,
  hydro: faHydro,
  pyro: faPyro,
  cryo: faCryo,
  dendro: faDendro,
  physical: faPhysicalDmgBonus,
}
const uncoloredEleIcons = {
  anemo: <FontAwesomeIcon icon={faAnemo as any} />,
  geo: <FontAwesomeIcon icon={faGeo as any} />,
  electro: <FontAwesomeIcon icon={faElectro as any} />,
  hydro: <FontAwesomeIcon icon={faHydro as any} />,
  pyro: <FontAwesomeIcon icon={faPyro as any} />,
  cryo: <FontAwesomeIcon icon={faCryo as any} />,
  dendro: <FontAwesomeIcon icon={faDendro as any} />,
  physical: <FontAwesomeIcon icon={faPhysicalDmgBonus as any} />,
} as const

const StatIcon = {
  hp_: <FontAwesomeIcon icon={faHp as any} />,
  hp: <FontAwesomeIcon icon={faHp as any} />,

  atk_: <FontAwesomeIcon icon={faAtk as any} />,
  atk: <FontAwesomeIcon icon={faAtk as any} />,

  def_: <FontAwesomeIcon icon={faDef as any} />,
  def: <FontAwesomeIcon icon={faDef as any} />,

  eleMas: <FontAwesomeIcon icon={faElementalMastery as any} />,
  critRate_: <FontAwesomeIcon icon={faCritRate as any} />,
  critDMG_: <FontAwesomeIcon icon={faCritDmg as any} />,
  enerRech_: <FontAwesomeIcon icon={faEnergyRecharge as any} />,
  incHeal_: <FontAwesomeIcon icon={faHealingAdd as any} />,
  heal_: <FontAwesomeIcon icon={faHealingBonus as any} />,

  cdRed_: <FontAwesomeIcon icon={faCdReduction as any} />,

  shield_: <FontAwesomeIcon icon={faShieldStrength as any} />,
  stamina: <FontAwesomeIcon icon={faMaxStamina as any} />,

  ...uncoloredEleIcons,
  ...Object.fromEntries(Object.keys(uncoloredEleIcons).flatMap(ele => [
    [`${ele}_dmg_`, uncoloredEleIcons[ele]],
    [`${ele}_res_`, uncoloredEleIcons[ele]],
    [`${ele}_critDMG_`, uncoloredEleIcons[ele]],
    [`${ele}_dmgInc`, uncoloredEleIcons[ele]],
    [`${ele}_enemyRes_`, uncoloredEleIcons[ele]]
  ]))
}

export default StatIcon
