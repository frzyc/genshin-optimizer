import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { PhaethonsMelody } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'PhaethonsMelody'
const [chg, ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = PhaethonsMelody.conditionals
const buff = PhaethonsMelody.buffs

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
        type: 'conditional',
        conditional: {
          label: ch('set4_cond_squad_use_ex'),
          metadata: cond.squad_use_ex,
          fields: [tagToTagField(buff.set4_squad_anomProf.tag)],
        },
      },
      {
        type: 'conditional',
        conditional: {
          label: ch('set4_cond_not_char_use_ex'),
          metadata: cond.not_char_use_ex,
          fields: [tagToTagField(buff.set4_not_self_ether_.tag)],
        },
      },
    ],
  },
}
export default sheet
