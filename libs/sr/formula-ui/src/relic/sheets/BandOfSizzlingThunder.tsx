import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import { relicAsset } from '@genshin-optimizer/sr/assets'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { buffs, conditionals } from '@genshin-optimizer/sr/formula'
import {
  getRelicInterpolateObject,
  mappedStats,
} from '@genshin-optimizer/sr/stats'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
import { getDefaultRelicSlot } from '@genshin-optimizer/sr/util'
import { trans } from '../../util'

const key: RelicSetKey = 'BandOfSizzlingThunder'
const [chg, _ch] = trans('relic', key)
const dm = mappedStats.relic[key]
const icon = relicAsset(key, getDefaultRelicSlot(key))
const cond = conditionals[key]
const buff = buffs[key]

const sheet: UISheet<'2' | '4'> = {
  2: {
    title: '2-Set', // TODO: L10n
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.2', getRelicInterpolateObject(key, 2)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: <StatDisplay statKey="lightning_dmg_" />,
            fieldValue: dm[2].passive_lightning_dmg_,
          },
        ],
      },
    ],
  },
  4: {
    title: '4-Set',
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.4', getRelicInterpolateObject(key, 4)),
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Skill used',
            additional: <SqBadge>4-Set</SqBadge>,
          },
          metadata: cond.skillUsed,
          label: '4-Set',
          fields: [
            {
              title: <StatDisplay statKey="atk_" />,
              fieldRef: buff.set4_atk_.tag,
            },
            { title: 'Duration', fieldValue: dm[4].duration },
          ],
        },
      },
    ],
  },
}
export default sheet
