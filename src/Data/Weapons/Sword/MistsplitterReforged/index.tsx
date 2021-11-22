import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import { allElements } from '../../../../Types/consts'
import { Translate } from '../../../../Components/Translate'
const ele_dmg_s = [12, 15, 18, 21, 24]
const ele_dmg_ss = [
  [8, 16, 28],
  [10, 20, 35],
  [12, 24, 42],
  [14, 28, 49],
  [16, 32, 56]
]

const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, ele_dmg_s[stats.weapon.refineIndex]])),
  document: [{
    conditional: {//Emblem
      key: "em",
      name: <Translate ns="weapon_MistsplitterReforged" key18="emblem" />,
      states: Object.fromEntries([1, 2, 3].map(stacks => [stacks, {
        name: <Translate ns="sheet" key18="stack" values={{ count: stacks }} />,
        stats: stats => ({
          [`${stats.characterEle}_dmg_`]: ele_dmg_ss[stats.weapon.refineIndex][stacks - 1]
        })
      }]))
    }
  }],
}
export default weapon