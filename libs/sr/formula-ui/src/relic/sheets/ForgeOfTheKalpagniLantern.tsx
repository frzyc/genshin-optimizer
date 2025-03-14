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

const key: RelicSetKey = 'ForgeOfTheKalpagniLantern'
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
            title: <StatDisplay statKey="spd_" />,
            fieldRef: buff.set2_passive_spd_.tag,
          },
        ],
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Hits enemy with Fire Weakness', // TODO: L10n
            additional: <SqBadge>2-Set</SqBadge>, // TODO: L10n
          },
          metadata: cond.enemyHit,
          label: '2-Set',
          fields: [
            {
              title: <StatDisplay statKey="brEffect_" />,
              fieldRef: buff.set2_brEffect_.tag,
            },
            // TODO: translate DM "Duration"
            { title: 'Duration', fieldValue: dm[2].duration },
          ],
        },
      },
    ],
  },
}
export default sheet
