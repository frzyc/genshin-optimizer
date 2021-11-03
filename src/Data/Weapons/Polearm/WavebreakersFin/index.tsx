import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { range } from '../../../../Util/Util'
import { TransWrapper } from '../../../../Components/Translate'

const energyRange = range(4, 36).map(i => i * 10)
const ratio = [0.12, 0.15, 0.18, 0.21, 0.24]
const max = [40, 50, 60, 70, 80]

const conditionals: IConditionals = {
  pa: {
    name: <TransWrapper ns="weapon_WavebreakersFin" key18="party" />,
    states: Object.fromEntries(energyRange.map(c => [c, {
      name: `${c}`,
      stats: stats => ({
        burst_dmg_: Math.min(max[stats.weapon.refineIndex], ratio[stats.weapon.refineIndex] * c),
      })
    }]))
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  conditionals,
  document: [{
    conditional: conditionals.pa
  }],
}
export default weapon