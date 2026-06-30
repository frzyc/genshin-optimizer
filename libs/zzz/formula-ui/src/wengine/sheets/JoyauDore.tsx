import type { UISheetElement } from '@genshin-optimizer/game-opt-sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz-assets'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { JoyauDore } from '@genshin-optimizer/zzz-formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'JoyauDore'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = JoyauDore.conditionals
const buff = JoyauDore.buffs

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
      fields: [fieldForBuff(buff.passive_anomProf)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond_windExSpecialUsed'),
        metadata: cond.windExSpecialUsed,
        fields: [
          fieldForBuff(buff.cond_vortex_buff_),
          fieldForBuff(buff.cond_windswept_buff_),
          fieldForBuff(buff.cond_anomProf),
        ],
      },
    },
  ],
}

export default sheet
