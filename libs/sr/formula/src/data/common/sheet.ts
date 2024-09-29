import type { AnyNode, StrNode } from '@genshin-optimizer/pando/engine'
import { cmpEq } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import {
  elementalTypes,
  listingItem,
  own,
  ownBuff,
  reader,
  register,
  tag,
} from '../util'

const data: TagMapNodeEntries = register(
  'static',
  // Common stat in listing
  // We can use for-loop to facilitate most of these entries,
  // but since this also dictates the order in the listing,
  // we manually call `registerStat` for more control.
  registerStat('hp', own.final.hp),
  registerStat('atk', own.final.atk),
  registerStat('def', own.final.def),
  registerStat('spd', own.final.spd),
  registerStat('enerRegen_', own.final.enerRegen_),
  registerStat('eff_', own.final.eff_),
  registerStat('eff_res_', own.final.eff_res_),
  registerStat('brEffect', own.final.brEffect_),
  registerStat('crit', own.common.cappedCrit_),
  registerStat('crit_dmg_', own.final.crit_dmg_),
  registerStat('heal_', own.final.heal_),
  elementalTypes.flatMap((ele) =>
    registerStat(
      `${ele}_dmg_`,
      own.final.dmg_[ele],
      cmpEq(own.char.ele, ele, 'unique', '')
    )
  ),
  registerStat('dmg_', own.final.dmg_),
  registerStat('weakness_', own.final.weakness_),
  registerStat('resPen_', own.final.resPen_)
)

function registerStat(
  name: string,
  target: AnyNode,
  cond?: string | StrNode
): TagMapNodeEntries {
  const formula = reader.withTag({
    et: 'display',
    qt: 'formula',
    q: 'stat',
    name,
  })
  const listing = ownBuff.listing.formulas
  return [
    listing.add(listingItem(formula, cond)), // Add formula to listing
    formula.add(tag(target, { name: null })), // Link formula to target
  ]
}

export default data
