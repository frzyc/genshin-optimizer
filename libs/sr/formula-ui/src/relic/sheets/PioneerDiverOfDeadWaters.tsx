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

const key: RelicSetKey = 'PioneerDiverOfDeadWaters'
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
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Enemy affected by a debuff', // TODO: L10n
            additional: <SqBadge>4-Set</SqBadge>, // TODO: L10n
          },
          metadata: cond.affectedByDebuff,
          label: '4-Set',
          fields: [
            {
              title: <StatDisplay statKey="dmg_" />,
              fieldRef: buff.set2_common_dmg_.tag,
            },
          ],
        },
      },
    ],
  },
  4: {
    title: '4-Set', // TODO: L10n
    img: icon,
    documents: [
      {
        type: 'text',
        text: chg('setEffects.4', getRelicInterpolateObject(key, 4)),
      },
      {
        type: 'fields',
        fields: [
          {
            title: <StatDisplay statKey="crit_" />,
            fieldRef: buff.set4_passive_crit_.tag,
          },
        ],
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Enemy debuff count', // TODO: L10n
            additional: <SqBadge>4-Set</SqBadge>, // TODO: L10n
          },
          metadata: cond.debuffCount,
          label: '4-Set',
          fields: [
            {
              title: <StatDisplay statKey="crit_dmg_" />,
              fieldRef: buff.set4_crit_dmg_.tag,
            },
          ],
        },
      },
      {
        type: 'conditional',
        conditional: {
          header: {
            icon: <ImgIcon src={icon} />,
            text: 'Wearer inflics a debuff', // TODO: L10n
            additional: <SqBadge>4-Set</SqBadge>, // TODO: L10n
          },
          metadata: cond.wearerDebuff,
          label: '4-Set',
          fields: [
            {
              title: <StatDisplay statKey="crit_" />,
              fieldRef: buff.set4_crit_.tag,
            },
            // TODO: translate DM "Duration"
            { title: 'Duration', fieldValue: dm[4].duration },
          ],
        },
      },
    ],
  },
}
export default sheet
