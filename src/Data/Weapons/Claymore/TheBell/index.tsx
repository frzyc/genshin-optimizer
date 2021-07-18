import { WeaponData } from 'pipeline'
import Stat from '../../../../Stat'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import img from './Weapon_The_Bell.png'


const dmg_s = [12, 15, 18, 21, 24]
const conditionals: IConditionals = {
  rg: {
    name: "Taking DMG",
    maxStack: 1,
    stats: stats => ({
      dmg_: dmg_s[stats.weapon.refineIndex]
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    fields: [{
      text: "Shield Absorption",
      formulaText: stats => <span>{data.shield[stats.weapon.refineIndex]}% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("powShield_", stats)})</span>,
      formula: formula.shield,
    }],
    conditional: conditionals.rg
  }]
}
export default weapon