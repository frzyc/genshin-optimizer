import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { KnightsExtolment } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'KnightsExtolment'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = KnightsExtolment.conditionals
const buff = KnightsExtolment.buffs

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
        metadata: cond.battleEdge,
        fields: [
          fieldForBuff(buff.cond_crit_dmg_),
          fieldForBuff(buff.cond_ice_resIgn_),
        ],
      },
    },
  ],
}

export default sheet
