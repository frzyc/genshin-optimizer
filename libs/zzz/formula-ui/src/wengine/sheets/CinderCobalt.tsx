import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { CinderCobalt } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { st, tagToTagField, trans } from '../../util'
import { PhaseWrapper } from '../components'

const key: WengineKey = 'CinderCobalt'
const [chg] = trans('wengine', key)
const dm = mappedStats.wengine[key]
const icon = wengineAsset(key, 'icon')
const cond = CinderCobalt.conditionals
const buff = CinderCobalt.buffs

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
        label: st('enterCombatOrSwitchIn'),
        metadata: cond.enteringCombatOrSwitchingIn,
        fields: [
          tagToTagField(buff.enteringCombatOrSwitchingIn_atk_.tag),
          {
            title: st('duration'),
            fieldValue: dm.duration,
          },
          {
            title: st('cd'),
            fieldValue: dm.cd,
          },
        ],
      },
    },
  ],
}

export default sheet
