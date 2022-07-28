import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { objectKeyMap } from '../Util/Util'
import ColorText from './ColoredText'
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
export const uncoloredEleIcons = {
  anemo: <FontAwesomeIcon icon={faAnemo as any} fixedWidth />,
  geo: <FontAwesomeIcon icon={faGeo as any} fixedWidth />,
  electro: <FontAwesomeIcon icon={faElectro as any} fixedWidth />,
  hydro: <FontAwesomeIcon icon={faHydro as any} fixedWidth />,
  pyro: <FontAwesomeIcon icon={faPyro as any} fixedWidth />,
  cryo: <FontAwesomeIcon icon={faCryo as any} fixedWidth />,
  dendro: <FontAwesomeIcon icon={faDendro as any} fixedWidth />,
  physical: <FontAwesomeIcon icon={faPhysicalDmgBonus as any} fixedWidth />,
} as const
const coloredEleIcon = objectKeyMap(Object.keys(uncoloredEleIcons), key => <ColorText color={key} sx={{ lineHeight: 1 }} >{uncoloredEleIcons[key]}</ColorText>)

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

  ...coloredEleIcon,
  ...Object.fromEntries(Object.keys(coloredEleIcon).flatMap(ele => [
    [`${ele}_dmg_`, coloredEleIcon[ele]],
    [`${ele}_res_`, coloredEleIcon[ele]],
    [`${ele}_critDMG_`, coloredEleIcon[ele]],
    [`${ele}_dmgInc`, coloredEleIcon[ele]],
    [`${ele}_enemyRes_`, coloredEleIcon[ele]]
  ]))
}

export default StatIcon
