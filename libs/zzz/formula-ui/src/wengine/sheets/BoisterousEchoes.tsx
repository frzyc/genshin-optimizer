import type { UISheetElement } from '@genshin-optimizer/game-opt-sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz-assets'
import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { BoisterousEchoes } from '@genshin-optimizer/zzz-formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'BoisterousEchoes'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = BoisterousEchoes.conditionals
const buff = BoisterousEchoes.buffs

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
        label: ch('cond_enemyAnomaly'),
        metadata: cond.enemyAnomaly,
        fields: [fieldForBuff(buff.cond_common_dmg_)],
      },
    },
  ],
}

export default sheet
