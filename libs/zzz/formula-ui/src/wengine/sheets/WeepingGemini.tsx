import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { WeepingGemini } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'WeepingGemini'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = WeepingGemini.conditionals
const buff = WeepingGemini.buffs

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
        metadata: cond.anomaly_stack,
        fields: [tagToTagField(buff.anomProf.tag)],
      },
    },
  ],
}

export default sheet
