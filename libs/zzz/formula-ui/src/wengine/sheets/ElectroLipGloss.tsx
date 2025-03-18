import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { TagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'ElectroLipGloss'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = conditionals[key]
const buff = buffs[key]

const sheet: UISheetElement = {
  title: chg('passive.name'),
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
          TagToTagField(buff.atk_.tag),
          TagToTagField(buff.common_dmg_.tag),
        ],
      },
    },
  ],
}

export default sheet
