import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { DawnsBloom } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'DawnsBloom'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = DawnsBloom.conditionals
const buff = DawnsBloom.buffs

const sheet: UISheet<'2' | '4'> = {
  2: {
    title: <Set2Display />,
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('desc2'),
      },
      {
        type: 'fields',
        fields: [tagToTagField(buff.set2_basic_dmg_.tag)],
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
        fields: [tagToTagField(buff.set4_basic_dmg_.tag)],
      },
      {
        type: 'conditional',
        conditional: {
          label: st('uponLaunch.2', {
            val1: '$t(skills.exSpecial)',
            val2: '$t(skills.ult)',
          }),
          metadata: cond.exSpecial_ult_used,
          fields: [tagToTagField(buff.set4_extra_basic_dmg_.tag)],
        },
      },
    ],
  },
}
export default sheet
