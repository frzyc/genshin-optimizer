import { WeaponData } from 'pipeline'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../../Build/Build'
import { TransWrapper } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'


const dmg_s = [12, 15, 18, 21, 24]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    anemo_dmg_: dmg_s[stats.weapon.refineIndex],
    geo_dmg_: dmg_s[stats.weapon.refineIndex],
    electro_dmg_: dmg_s[stats.weapon.refineIndex],
    hydro_dmg_: dmg_s[stats.weapon.refineIndex],
    pyro_dmg_: dmg_s[stats.weapon.refineIndex],
    cryo_dmg_: dmg_s[stats.weapon.refineIndex],
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