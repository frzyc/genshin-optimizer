import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { FeatheredFate } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'FeatheredFate'
const [chg, ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = FeatheredFate.conditionals
const buff = FeatheredFate.buffs

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
          label: ch('set4_cond'),
          metadata: cond.entersOrActive,
          fields: [
            fieldForBuff(buff.set4_anomProf),
            fieldForBuff(buff.set4_buff_),
          ],
        },
      },
    ],
  },
}
export default sheet
