import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { ThornedRose } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'ThornedRose'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const buff = ThornedRose.buffs

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
        fields: [fieldForBuff(buff.set4_dmg_), fieldForBuff(buff.set4_crit_)],
      },
    ],
  },
}
export default sheet
