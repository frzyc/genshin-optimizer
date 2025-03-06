import { lookup, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allStats } from '@genshin-optimizer/sr/stats'
import type { ElementalType, TagMapNodeEntries } from '../util'
import { own, ownBuff, percent, semiOwn } from '../util'

const breakBaseRatios: Record<ElementalType, number> = {
  physical: 2,
  fire: 2,
  ice: 1,
  lightning: 1,
  wind: 1.5,
  quantum: 0.5,
  imaginary: 0.5,
}
const data: TagMapNodeEntries = [
  // Formula calculations
  ownBuff.formula.dmg.add(prod(own.dmg.out, own.dmg.critMulti, own.dmg.inDmg)),
  ownBuff.formula.shield.add(
    prod(own.formula.base, sum(percent(1), own.premod.shield_))
  ),
  // Use semiOwn to handle targeted heals that scale off target's stats
  ownBuff.formula.heal.add(
    prod(semiOwn.formula.base, sum(percent(1), own.final.heal_))
  ),
  ownBuff.formula.breakDmg.add(
    prod(
      own.formula.base,
      lookup(own.char.ele, breakBaseRatios),
      subscript(own.char.lvl, allStats.misc.breakLevelMulti),
      sum(percent(1), own.final.brEffect_),
      own.dmg.inDmg
    )
  ),
]
export default data
