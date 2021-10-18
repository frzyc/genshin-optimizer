import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const refinementVals = [4, 5, 6, 7, 8]
const refinementMoveSpdVals = [10, 10, 10, 10, 10]
const refinementatkSpdVals = [10, 10, 10, 10, 10]
const conditionals: IConditionals = {
  spf: {
    name: "After Elemental Burst",
    maxStack: 1,
    stats: stats => ({
      moveSPD_: refinementMoveSpdVals[stats.weapon.refineIndex],
      atkSPD_: refinementatkSpdVals[stats.weapon.refineIndex],
    }),
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.dmg[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    critRate_: refinementVals[stats.weapon.refineIndex]
  }),
  conditionals,
  document: [{
    conditional: conditionals.spf
  }],
}
export default weapon