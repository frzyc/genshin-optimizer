import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { YesterdayCalls } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'YesterdayCalls'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = YesterdayCalls.conditionals
const buff = YesterdayCalls.buffs

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
        label: ch('cond1'),
        metadata: cond.offField,
        fields: [tagToTagField(buff.cond_enerRegen.tag)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond2'),
        metadata: cond.physExSpecialUsed,
        fields: [
          tagToTagField(buff.cond_dazeInc_.tag),
          tagToTagField(buff.cond_crit_dmg_.tag),
        ],
      },
    },
  ],
}

export default sheet
