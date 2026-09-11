import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CattyLuck } from '@genshin-optimizer/zzz/formula'
import { fieldForBuff } from '../../char/sheetUtil'
import { st, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CattyLuck'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CattyLuck.conditionals
const buff = CattyLuck.buffs

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
      fields: [fieldForBuff(buff.passive_def_)],
    },
    {
      type: 'conditional',
      conditional: {
        label: st('uponLaunch.1', { val1: '$t(skills.exSpecial)' }),
        metadata: cond.exSpecialUsed,
        fields: [fieldForBuff(buff.cond_def_)],
      },
    },
  ],
}

export default sheet
