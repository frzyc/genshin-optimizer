import {
  cmpEq,
  lookup,
  max,
  prod,
  subscript,
  sum,
  sumfrac,
} from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, enemyDebuff, own, ownBuff, percent } from '../util'

const defLevelFactor = [
  -1, 50, 54, 58, 62, 66, 71, 76, 82, 88, 94, 100, 107, 114, 121, 129, 137, 145,
  153, 162, 172, 181, 191, 201, 211, 222, 233, 245, 256, 268, 281, 293, 306,
  319, 333, 347, 361, 375, 390, 405, 421, 436, 452, 469, 485, 502, 519, 537,
  555, 573, 592, 610, 629, 649, 669, 689, 709, 730, 751, 772, 794,
]

const data: TagMapNodeEntries = [
  // Factors shared between standard and anomaly damage
  ...[
    ownBuff.dmg.dmg_mult_,
    ownBuff.dmg.buff_mult_,
    ownBuff.dmg.def_mult_,
    ownBuff.dmg.res_mult_,
    ownBuff.dmg.dmg_taken_mult_,
    ownBuff.dmg.stunned_mult_,
  ].map((buff) => ownBuff.dmg.shared.add(buff)),

  // DMG Bonus Multiplier
  ownBuff.dmg.dmg_mult_.add(
    sum(percent(1), own.final.dmg_, own.final.common_dmg_)
  ),
  // Buff Multiplier (e.g. Timeweaver Disorder DMG Bonus)
  ownBuff.dmg.buff_mult_.add(sum(percent(1), own.final.buff_)),
  // DEF Multiplier
  // levelFactor / (max(def * (1 - defRed_) * (1 - pen_) - pen, 0) + levelFactor)
  ownBuff.dmg.def_mult_.add(
    sumfrac(
      subscript(own.char.lvl, defLevelFactor),
      max(
        sum(
          prod(
            enemy.common.def,
            sum(percent(1), prod(-1, enemyDebuff.common.defRed_)),
            sum(percent(1), prod(-1, own.final.pen_))
          ),
          prod(-1, own.final.pen)
        ),
        0
      )
    )
  ),
  // RES Multiplier
  ownBuff.dmg.res_mult_.add(
    sum(
      percent(1),
      prod(-1, enemy.common.res_),
      enemy.common.resRed_,
      own.final.resIgn_
    )
  ),
  // DMG Taken Multiplier
  ownBuff.dmg.dmg_taken_mult_.add(
    sum(percent(1), enemy.common.dmgInc_, prod(-1, enemy.common.dmgRed_))
  ),
  // Stunned Multiplier
  ownBuff.dmg.stunned_mult_.add(
    cmpEq(enemy.common.isStunned, 1, enemy.common.stun_, enemy.common.unstun_)
  ),

  ownBuff.dmg.crit_mult_.add(
    lookup(own.common.critMode, {
      crit: sum(percent(1), own.final.crit_dmg_),
      nonCrit: percent(1),
      avg: sum(percent(1), prod(own.common.cappedCrit_, own.final.crit_dmg_)),
    })
  ),
]
export default data
