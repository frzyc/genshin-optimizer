import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  own,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'KingOfTheSummit'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { launchExSpecialOrChain } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_team_launchExSpecialOrChain_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(
        discCount,
        4,
        cmpEq(
          own.char.specialty,
          'stun',
          launchExSpecialOrChain.ifOn(
            cmpGE(
              own.final.crit_,
              percent(0.5),
              percent(0.15 + 0.15),
              percent(0.15)
            )
          )
        )
      )
    ),
    showCond4Set
  )
)
export default sheet
