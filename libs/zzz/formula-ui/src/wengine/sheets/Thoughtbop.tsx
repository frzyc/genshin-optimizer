import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { Thoughtbop } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'Thoughtbop'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = Thoughtbop.conditionals
const buff = Thoughtbop.buffs

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
      type: 'conditional',
      conditional: {
        label: st('offField'),
        metadata: cond.offField,
        fields: [tagToTagField(buff.cond_enerRegen.tag)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('physExSpecialUsed'),
        metadata: cond.physExSpecialUsed,
        fields: [
          tagToTagField(buff.team_common_dmg_.tag),
          tagToTagField(buff.team_atk_.tag),
        ],
      },
    },
  ],
}

export default sheet
