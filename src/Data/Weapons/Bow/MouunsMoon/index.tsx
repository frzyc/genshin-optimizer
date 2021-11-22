import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { range } from '../../../../Util/Util'
import { Translate } from '../../../../Components/Translate'

const energyRange = range(4, 36).map(i => i * 10)
const ratio = [0.12, 0.15, 0.18, 0.21, 0.24]
const max = [40, 50, 60, 70, 80]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "pa",
      name: <Translate ns="weapon_MouunsMoon" key18="party" />,
      states: Object.fromEntries(energyRange.map(c => [c, {
        name: `${c}`,
        stats: stats => ({
          burst_dmg_: Math.min(max[stats.weapon.refineIndex], ratio[stats.weapon.refineIndex] * c),
        })
      }]))
    }
  }],
}
export default weapon