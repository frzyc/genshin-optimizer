import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { DeepSeaVisitor } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'DeepSeaVisitor'
const [chg, ch] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = DeepSeaVisitor.conditionals
const buff = DeepSeaVisitor.buffs

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
      fields: [tagToTagField(buff.passive_ice_dmg_.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond1'),
        metadata: cond.basicHit,
        fields: [
          tagToTagField(buff.crit_.tag),
          {
            title: 'Duration', // TODO: L10n,
            fieldValue: dm.duration,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond2'),
        metadata: cond.iceDashAtkHit,
        fields: [
          tagToTagField(buff.extra_crit_.tag),
          {
            title: 'Duration', // TODO: L10n,
            fieldValue: dm.extra_duration,
          },
        ],
      },
    },
  ],
}

export default sheet
