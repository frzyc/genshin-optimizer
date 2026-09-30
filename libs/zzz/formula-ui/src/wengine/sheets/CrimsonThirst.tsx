import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CrimsonThirst } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CrimsonThirst'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CrimsonThirst.conditionals
const buff = CrimsonThirst.buffs

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
        fieldForBuff(buff.passive_crit_),
        fieldForBuff(buff.passive_electric_dmg_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('exSpecialMaim'),
        metadata: cond.exSpecialMaim,
        fields: [fieldForBuff(buff.cond_electric_sharp_dmg_)],
      },
    },
  ],
}

export default sheet
