import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'BranchBladeSong'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

const { apply_or_trigger } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),
  //passive
  registerBuff(
    'set4_passive',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(discCount, 4, cmpGE(own.final.anomMas, 115, 0.3)),
    ),
    showCond4Set,
  ),
  // Conditional buffs
  registerBuff(
    'set4_cond',
    ownBuff.combat.crit_.add(cmpGE(discCount, 4, apply_or_trigger.ifOn(0.12))),
    showCond4Set,
  ),
)
export default sheet
