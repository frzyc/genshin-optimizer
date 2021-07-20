import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula from './data'
import data_gen from './data_gen.json'
import img from './Weapon_Skyward_Harp.png'

const critd_s = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    critDMG_: critd_s[stats.weapon.refineIndex]
  }),
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>125% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon