import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { st } from '../../../Characters/SheetUtil'
const refinementVals = [4, 5, 6, 7, 8]
const refinementMoveSpdVals = [10, 10, 10, 10, 10]
const refinementatkSpdVals = [10, 10, 10, 10, 10]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    critRate_: refinementVals[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {
      key: "spf",
      name: "After Elemental Burst",
      maxStack: 1,
      stats: stats => ({
        moveSPD_: refinementMoveSpdVals[stats.weapon.refineIndex],
        atkSPD_: refinementatkSpdVals[stats.weapon.refineIndex],
      }),
      fields: [{
        text: st("dmg"),
        formulaText: stats => <span>{data.dmg[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
        formula: formula.dmg,
        variant: stats => getTalentStatKeyVariant("physical", stats),
      }]
    }
  }],
}
export default weapon