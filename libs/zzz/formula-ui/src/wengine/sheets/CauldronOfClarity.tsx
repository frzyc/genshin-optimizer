import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CauldronOfClarity } from '@genshin-optimizer/zzz/formula'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CauldronOfClarity'
const [chg, _ch] = trans('wengine', key)
const icon = wengineAsset(key, 'icon')
const cond = CauldronOfClarity.conditionals
const buff = CauldronOfClarity.buffs

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
        metadata: cond.exSpecialActivated,
        fields: [
          tagToTagField(buff.cond_common_dmg_.tag),
          tagToTagField(buff.cond_crit_.tag),
        ],
      },
    },
  ],
}

export default sheet
