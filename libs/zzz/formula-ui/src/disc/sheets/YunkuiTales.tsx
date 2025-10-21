import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { YunkuiTales } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'YunkuiTales'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = YunkuiTales.conditionals
const buff = YunkuiTales.buffs

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
        fields: [tagToTagField(buff.set2.tag)],
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
          metadata: cond.uponLaunchExSpecialChainOrUlt,
          label: st('uponLaunch.3', {
            val1: '$t(skills.exSpecial)',
            val2: '$t(skills.chain)',
            val3: '$t(skills.ult)',
          }),
          fields: [
            tagToTagField(buff.set4_crit_.tag),
            tagToTagField(buff.set4_sheer_dmg_.tag),
          ],
        },
      },
    ],
  },
}
export default sheet
