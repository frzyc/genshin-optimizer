import { IWeaponSheet } from '../../../../Types/weapon'
import img from './Weapon_The_Black_Sword.png'
import formula, { data } from './data'
import { TransWrapper } from "../../../../Components/Translate"
import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import Stat from '../../../../Stat'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => ({
    normal_dmg_: data.dmg_[stats.weapon.refineIndex],
    charged_dmg_: data.dmg_[stats.weapon.refineIndex]
  }),
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet_gen" key18="healing" />,
      formulaText: stats => <span>{data.heal[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.regen,
      variant: "success"
    }]
  }]
}
export default weapon