import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'PhaethonsMelody'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

// TODO: Add conditionals
const { squad_use_ex } = allBoolConditionals(key)
const { not_char_use_ex } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // Conditional buffs
  registerBuff(
    'set4_squad_anomProf',
    ownBuff.combat.anomProf.add(cmpGE(discCount, 4, squad_use_ex.ifOn(45))),
    showCond4Set
  ),
  registerBuff(
    'set4_not_self_ether_',
    ownBuff.combat.dmg_.ether.add(
      cmpGE(discCount, 4, squad_use_ex.ifOn(not_char_use_ex.ifOn(0.25)))
    ),
    showCond4Set
  )
)
export default sheet
