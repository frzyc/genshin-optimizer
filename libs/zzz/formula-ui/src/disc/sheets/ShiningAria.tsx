import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { ShiningAria } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { Set2Display, Set4Display } from '../components'

const key: DiscSetKey = 'ShiningAria'
const [chg, _ch] = trans('disc', key)
const icon = discDefIcon(key)
const cond = ShiningAria.conditionals
const buff = ShiningAria.buffs

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
          label: st('uponHit.1', { val1: '$t(skills.basic)' }),
          metadata: cond.enemyHit,
          fields: [
            tagToTagField(buff.set4_anomProf.tag),
            tagToTagField(buff.set4_common_dmg_.tag),
          ],
        },
      },
    ],
  },
}
export default sheet
