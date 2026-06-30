import type { UISheet } from '@genshin-optimizer/game-opt-sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz-assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz-consts'
import { WutheringSalon } from '@genshin-optimizer/zzz-formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { st, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'WutheringSalon'
const [chg, ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = WutheringSalon.conditionals
const buff = WutheringSalon.buffs

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
          label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
          metadata: cond.exSpecialUsed,
          fields: [fieldForBuff(buff.set4_anomProf)],
        },
      },
      {
        type: 'conditional',
        conditional: {
          label: ch('set4_windsweptTriggered'),
          metadata: cond.windsweptTriggered,
          fields: [fieldForBuff(buff.set4_common_dmg_)],
        },
      },
    ],
  },
}
export default sheet
