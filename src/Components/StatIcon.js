import { faDice, faDiceD20, faFirstAid, faFistRaised, faMagic, faShieldAlt, faSync, faTint } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const StatIcon = {
  hp_base: faTint,
  hp_final: faTint,
  hp_: faTint,
  hp: faTint,

  atk_base: faFistRaised,
  atk_character_base: faFistRaised,
  atk_final: faFistRaised,
  atk_: faFistRaised,
  atk: faFistRaised,

  def_base: faShieldAlt,
  def_final: faShieldAlt,
  def_: faShieldAlt,
  def: faShieldAlt,

  ele_mas: faMagic,
  crit_rate: faDice,
  crit_dmg: faDiceD20,
  ener_rech: faSync,
  heal_bonu: faFirstAid,
}

const StatIconEle = (statKey) =>
  StatIcon[statKey] ? <FontAwesomeIcon icon={StatIcon[statKey]} className="fa-fw" /> : null

export default StatIcon

export {
  StatIconEle
}