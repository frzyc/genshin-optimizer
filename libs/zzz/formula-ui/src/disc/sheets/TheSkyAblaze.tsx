import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { TheSkyAblaze } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { st, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'TheSkyAblaze'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = TheSkyAblaze.conditionals
const buff = TheSkyAblaze.buffs

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
        fields: [fieldForBuff(buff.set4_crit_dmg_)],
      },
      {
        type: 'conditional',
        conditional: {
          label: st('uponLaunch.2', {
            val1: '$t(skills.exSpecial)',
            val2: '$t(skills.ult)',
          }),
          metadata: cond.exSpecialUltUsed,
          fields: [fieldForBuff(buff.set4_atk_)],
        },
      },
    ],
  },
}
export default sheet
