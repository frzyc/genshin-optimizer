import { faDiceD20 } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { hitMoves } from '../StatConstants'
import { objectKeyMap } from '../Util/Util'
import ColorText from './ColoredText'
import { faAnemo, faAtk, faCdReduction, faCritRate, faCryo, faDef, faDendro, faElectro, faElementalMastery, faEnergyRecharge, faGeo, faHealingBonus, faHp, faHydro, faMaxStamina, faPhysicalDmgBonus, faPyro, faShieldStrength } from './faIcons'

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
const coloredEleIcon = objectKeyMap(Object.keys(uncoloredEleIcons), key => <ColorText color={key} >{uncoloredEleIcons[key]}</ColorText>)

const StatIcon = {
  hp_: <FontAwesomeIcon icon={faHp as any} />,
  hp: <FontAwesomeIcon icon={faHp as any} />,

  atk_: <FontAwesomeIcon icon={faAtk as any} />,
  atk: <FontAwesomeIcon icon={faAtk as any} />,

  def_: <FontAwesomeIcon icon={faDef as any} />,
  def: <FontAwesomeIcon icon={faDef as any} />,

  eleMas: <FontAwesomeIcon icon={faElementalMastery as any} />,
  critRate_: <FontAwesomeIcon icon={faCritRate as any} />,
  bonus_critRate_: <FontAwesomeIcon icon={faCritRate as any} />,
  critDMG_: <FontAwesomeIcon icon={faDiceD20 as any} />,
  ...Object.fromEntries(Object.keys(hitMoves).flatMap(move => [
    [`${move}_critRate_`, <FontAwesomeIcon icon={faCritRate as any} />],
    [`${move}_critDmg_`, <FontAwesomeIcon icon={faCritRate as any} />],
  ])),
  enerRech_: <FontAwesomeIcon icon={faEnergyRecharge as any} />,
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
