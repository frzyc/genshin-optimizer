import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { SolExuvia } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'SolExuvia'
const [chg, ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = SolExuvia.conditionals
const buff = SolExuvia.buffs

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
        label: ch('cond_eclipse'),
        metadata: cond.eclipse,
        fields: [fieldForBuff(buff.cond_ether_resIgn_)],
      },
    },
  ],
}

export default sheet
