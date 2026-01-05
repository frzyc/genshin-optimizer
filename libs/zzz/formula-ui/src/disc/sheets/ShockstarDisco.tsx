import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { ShockstarDisco } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'ShockstarDisco'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const buff = ShockstarDisco.buffs

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
        fields: [
          tagToTagField(buff.set4_basic_daze_.tag),
          tagToTagField(buff.set4_dash_daze_.tag),
          tagToTagField(buff.set4_dodgeCounter_daze_.tag),
        ],
      },
    ],
  },
}
export default sheet
