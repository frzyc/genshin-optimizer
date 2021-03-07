import { faDice, faDiceD20, faFirstAid, faFistRaised, faMagic, faShieldAlt, faSync, faTint } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const StatIcon = {
  characterHP: faTint,
  finalHP: faTint,
  hp_: faTint,
  hp: faTint,

  baseATK: faFistRaised,
  characterATK: faFistRaised,
  finalATK: faFistRaised,
  atk_: faFistRaised,
  atk: faFistRaised,

  characterDEF: faShieldAlt,
  finalDEF: faShieldAlt,
  def_: faShieldAlt,
  def: faShieldAlt,

  eleMas: faMagic,
  critRate_: faDice,
  critDMG_: faDiceD20,
  enerRech_: faSync,
  heal_: faFirstAid,
}

const StatIconEle = (statKey) =>
  StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null

export default StatIcon

export {
  StatIconEle
}