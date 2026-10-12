import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { ChiefSidekick } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { st, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'ChiefSidekick'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = ChiefSidekick.conditionals
const buff = ChiefSidekick.buffs

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
      fields: [
        fieldForBuff(buff.passive_impact),
        fieldForBuff(buff.passive_fire_resIgn_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: st('offField'),
        metadata: cond.offField,
        fields: [fieldForBuff(buff.cond_energyRegen)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('cond_fireExSpecialUsed'),
        metadata: cond.fireExSpecialUsed,
        fields: [fieldForBuff(buff.cond_common_dmg_)],
      },
    },
  ],
}

export default sheet
