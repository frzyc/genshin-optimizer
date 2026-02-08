import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { AngelInTheShell } from '@genshin-optimizer/zzz/formula'
import { tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'AngelInTheShell'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = AngelInTheShell.conditionals
const buff = AngelInTheShell.buffs

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
      fields: [tagToTagField(buff.passive_anomProf.tag)],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('onFieldOrSpecialUsed'),
        metadata: cond.onFieldOrSpecialUsed,
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('enemyAnomaly'),
        metadata: cond.enemyAnomaly,
        fields: [
          tagToTagField(buff.cond_common_dmg_.tag),
          tagToTagField(buff.cond_anomaly_dmg_.tag),
        ],
      },
    },
  ],
}

export default sheet
