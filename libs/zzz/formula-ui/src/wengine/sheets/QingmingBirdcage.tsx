import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'QingmingBirdcage'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = conditionals[key]
const buff = buffs[key]

const sheet: UISheetElement = {
  title: chg('phase'),
  img: icon,
  documents: [
    {
      type: 'text',
      text: (
        <PhaseWrapper wKey={key}>
          {(phase) => chg(`phaseDescs.${phase - 1}`)}
        </PhaseWrapper>
      ),
    },
    {
      type: 'fields',
      fields: [tagToTagField(buff.crit_.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        metadata: cond.qingmingCompanionStacks,
        label: ch('cond'),
        fields: [
          tagToTagField(buff.qingmingCompanionStacks_ether_dmg_.tag),
          tagToTagField(buff.qingmingCompanionStacks_ult_ether_sheer_dmg_.tag),
          tagToTagField(
            buff.qingmingCompanionStacks_exSpecial_ether_sheer_dmg_.tag
          ),
          {
            title: st('cd'),
            fieldValue: dm.duration,
          },
        ],
      },
    },
  ],
}

export default sheet
