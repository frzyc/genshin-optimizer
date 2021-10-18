import { IWeaponSheet } from '../../../../Types/weapon'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'

import data_gen from './data_gen.json'
import { WeaponData } from 'pipeline'
import { IConditionals, IConditionalValue } from '../../../../Types/IConditional'
import { allElements } from '../../../../Types/consts'
import ElementalData from '../../../ElementalData'
import { TransWrapper } from '../../../../Components/Translate'
import { objectFromKeyMap } from '../../../../Util/Util'
const ele_dmg_s = [12, 15, 18, 21, 24]
const ele_dmg_ss = [
  [8, 16, 28],
  [10, 20, 35],
  [12, 24, 42],
  [14, 28, 49],
  [16, 32, 56]
]
const conditionals: IConditionals = {
  ele: {
    name: <TransWrapper ns="weapon_MistsplitterReforged" key18="ele" />,
    states: objectFromKeyMap(allElements, ele => ({
      name: ElementalData[ele].name
    }))
  },
  em: {//Emblem
    canShow: stats => {
      const value = stats.conditionalValues?.weapon?.MistsplitterReforged?.ele as IConditionalValue | undefined
      if (!value) return false
      const [num,] = value
      if (!num) return false
      return true
    },
    name: <TransWrapper ns="weapon_MistsplitterReforged" key18="emblem" />,
    states: Object.fromEntries([1, 2, 3].map(stacks => [stacks, {
      name: <TransWrapper ns="sheet" key18="stack" values={{ count: stacks }} />,
      stats: stats => {
        const [num, ele] = stats.conditionalValues?.weapon?.MistsplitterReforged?.ele ?? [0, ""] as IConditionalValue | undefined
        if (!num || !ele) return {}
        return {
          [`${ele}_dmg_`]: ele_dmg_ss[stats.weapon.refineIndex][stacks - 1]
        }
      }
    }]))

  }

}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, ele_dmg_s[stats.weapon.refineIndex]])),
  conditionals,
  document: [{
    conditional: conditionals.ele,
  }, {
    conditional: conditionals.em,
  }],
}
export default weapon