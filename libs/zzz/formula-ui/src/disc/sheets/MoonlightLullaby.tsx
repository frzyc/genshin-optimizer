import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { MoonlightLullaby } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'MoonlightLullaby'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = MoonlightLullaby.conditionals
const buff = MoonlightLullaby.buffs

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
          label: st('uponLaunch.2', {
            val1: '$t(skills.exSpecial)',
            val2: '$t(skills.ult)',
          }),
          metadata: cond.exSpecial_ult_used,
          fields: [tagToTagField(buff.set4_common_dmg_.tag)],
        },
      },
    ],
  },
}
export default sheet
