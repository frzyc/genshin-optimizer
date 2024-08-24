import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { characterAsset } from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { formulas } from '@genshin-optimizer/sr/formula'
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
        text: chg('auto.fields.normal'),
      },
      {
        type: 'fields',
        fields: Object.entries(formulas.RuanMei)
          .filter(([key]) => key.startsWith('normal'))
          .map(([_, { tag }], i) => ({
            title: chg(`auto.skillParams.${i}`),
            fieldRef: tag,
          })),
      },
      { type: 'text', text: chg(`abilities.basic.0.fullDesc`) },
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
