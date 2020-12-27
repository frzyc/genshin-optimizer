import { faDice, faDiceD20, faFirstAid, faFistRaised, faMagic, faShieldAlt, faSync, faTint } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const StatIcon = {
  hp: faTint,
  hp_: faTint,
  atk: faFistRaised,
  atk_: faFistRaised,
  def: faShieldAlt,
  def_: faShieldAlt,
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