import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula from './data'
import data_gen from './data_gen.json'
import img from './Weapon_Sword_of_Descension.png'
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  stats: stats => stats.characterKey.startsWith("traveler") ? {
    atk: 66
  } : {},
  document: [{
    fields: [{
      text: <TransWrapper ns="sheet" key18="dmg" />,
      formulaText: stats => <span>200% {Stat.printStat(getTalentStatKey("physical", stats), stats)}</span>,
      formula: formula.dmg,
      variant: stats => getTalentStatKeyVariant("physical", stats),
    }]
  }]
}
export default weapon