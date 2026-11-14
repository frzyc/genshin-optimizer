import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { PlumeOfRebirth } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'PlumeOfRebirth'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = PlumeOfRebirth.conditionals
const buff = PlumeOfRebirth.buffs

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
        label: ch('anomalyCrit'),
        metadata: cond.anomalyCrit,
        fields: [fieldForBuff(buff.cond_fire_dmg_)],
      },
    },
  ],
}

export default sheet
