import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CrimsonMoonCasket } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CrimsonMoonCasket'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CrimsonMoonCasket.conditionals
const buff = CrimsonMoonCasket.buffs

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
        fieldForBuff(buff.passive_wind_resIgn_),
      ],
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('windExSpecialUsed'),
        metadata: cond.windExSpecialUsed,
        fields: [
          fieldForBuff(buff.cond_dazeInc_),
          fieldForBuff(buff.cond_common_dmg_),
        ],
      },
    },
  ],
}

export default sheet
