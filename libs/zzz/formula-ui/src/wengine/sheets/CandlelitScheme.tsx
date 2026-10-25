import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CandlelitScheme } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { st, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CandlelitScheme'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CandlelitScheme.conditionals
const buff = CandlelitScheme.buffs

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
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.exSpecialUsed,
        fields: [fieldForBuff(buff.cond_crit_)],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: ch('enemyHpBelowHalf'),
        metadata: cond.enemyHpBelowHalf,
        fields: [fieldForBuff(buff.cond_common_dmg_)],
      },
    },
  ],
}

export default sheet
