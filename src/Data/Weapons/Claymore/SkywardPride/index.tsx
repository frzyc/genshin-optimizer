import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import img from './Weapon_Skyward_Pride.png'
const dmg_s = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    dmg_: dmg_s[stats.weapon.refineIndex]
  }),
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.dmg[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon