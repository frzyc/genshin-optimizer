import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Recurve_Bow.png'
import { TransWrapper } from "../../../../Components/Translate"
import formula, { data } from './data'
import Stat from '../../../../Stat'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet_gen" key18="healing" />,
      formulaText: stats => <span>{data.heal[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.heal,
      variant: "success"
    }]
  }]
}
export default weapon