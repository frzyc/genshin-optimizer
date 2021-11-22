import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { Translate } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
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