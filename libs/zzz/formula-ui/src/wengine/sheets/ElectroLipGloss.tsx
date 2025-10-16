import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { ElectroLipGloss } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'ElectroLipGloss'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = ElectroLipGloss.conditionals
const buff = ElectroLipGloss.buffs

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
        label: ch('cond'),
        metadata: cond.anomalyOnEnemy,
        fields: [
          tagToTagField(buff.atk_.tag),
          tagToTagField(buff.common_dmg_.tag),
        ],
      },
    },
  ],
}

export default sheet
