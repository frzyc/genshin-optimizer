import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { TagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'ChaoticMetal'
const [chg, ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = conditionals[key]
const buff = buffs[key]

const sheet: UISheet<'2' | '4'> = {
  2: {
    title: <Set2Display />,
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('desc2'),
      },
    ],
  },
  4: {
    title: <Set4Display />,
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('desc4'),
      },
      {
        type: 'fields',
        fields: [TagToTagField(buff.set4_passive.tag)],
      },
      {
        type: 'conditional',
        conditional: {
          label: ch('set4_cond'),
          metadata: cond.trigger_corruption,
          fields: [TagToTagField(buff.set4_cond_trigger_corruption.tag)],
        },
      },
    ],
  },
}
export default sheet
