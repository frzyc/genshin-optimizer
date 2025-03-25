import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { buffs } from '@genshin-optimizer/zzz/formula'
import { trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'ShockstarDisco'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
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
        fields: [
          {
            title: 'Basic Attack Daze', // TODO: L10n
            fieldRef: buff.set4_basic_daze_.tag,
          },
          {
            title: 'Dash Attack Daze', // TODO: L10n
            fieldRef: buff.set4_dash_daze_.tag,
          },
          {
            title: 'Dodge Counter Daze', // TODO: L10n
            fieldRef: buff.set4_dodgeCounter_daze_.tag,
          },
        ],
      },
    ],
  },
}
export default sheet
