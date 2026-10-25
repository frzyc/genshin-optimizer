import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { IncarceratingGrip } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'IncarceratingGrip'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = IncarceratingGrip.conditionals
const buff = IncarceratingGrip.buffs

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
      fields: [fieldForBuff(buff.passive_crit_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('basicHits'),
        metadata: cond.basicHits,
        fields: [
          fieldForBuff(buff.cond_atk_),
          fieldForBuff(buff.cond_wind_resIgn_),
        ],
      },
    },
  ],
}

export default sheet
