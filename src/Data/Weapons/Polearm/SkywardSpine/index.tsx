import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { Translate } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const crit_ = [8, 10, 12, 14, 16]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    critRate_: crit_[stats.weapon.refineIndex],
    atkSPD_: 12
  }),
  document: [{
    fields: [{
      text: <Translate ns="sheet" key18="dmg" />,
      formulaText: stats => <span>{data.dmg[stats.weapon.refineIndex]}% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon