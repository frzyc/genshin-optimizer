import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { formulas, own } from '@genshin-optimizer/sr/formula'
import { getInterpolateObject } from '@genshin-optimizer/sr/stats'
import { trans } from '../../util'
import type { TalentSheetElementKey } from '../consts'
const key: CharacterKey = 'RuanMei'
const [chg, _ch] = trans('char', key)
const sheet: UISheet<TalentSheetElementKey> = {
  basic: {
    name: chg('abilities.basic.0.name'),
    img: characterAsset(key, 'basic_0'),
    documents: [
      {
        type: 'text',
        text: (calculator) => {
          const basicLevel = calculator.compute(own.char.basic).val
          return chg(
            `abilities.basic.0.fullDesc`,
            getInterpolateObject(key, 'basic', basicLevel)
          )
        },
      },
      {
        type: 'fields',
        fields: [
          {
            title: chg('abilities.basic.0.shortDesc'),
            fieldRef: formulas.RuanMei.basicDmg_0.tag,
          },
        ],
      },
    ],
  },
}

export default sheet
