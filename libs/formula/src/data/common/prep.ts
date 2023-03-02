import { cmpEq, dynTag, lookup, prod, sum } from '@genshin-optimizer/waverider'
import { Data, enemy, percent, self, selfBuff, tagVal } from '../util'

const { ele, amp, cata } = self.prep

const data: Data = [
  selfBuff.formula.dmg.add(dynTag(
    prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg),
    { ele, amp, cata } // `move:` is fixed
  )),
  selfBuff.formula.shield.add(
    // No `prep` needed for `q:shield`; `ele:` is fixed
    prod(self.formula.base, sum(percent(1), self.base.shield_))
  ),
  selfBuff.formula.heal.add(
    // No `prep` needed for `q:heal`
    prod(self.formula.base, sum(percent(1), self.base.heal_))
  ),

  /* `prep:` formulas have a stricter restriction as it is computed before most
   * computations are ready. Most `stats`-related queries are not available, and
   * we are essentially limited to other preps and conditionals. If the value is
   * always awailable from the tag, we can use an unrestricted `tagVal` here.
   *
   * Some are outside of this file as it has to be in a util function, but the
   * restriction nonetheless applies.
   */

  selfBuff.prep.move.add(tagVal('move')),
  selfBuff.prep.trans.add(tagVal('trans')),
  selfBuff.prep.amp.add(lookup(self.prep.ele, {
    cryo: cmpEq(enemy.cond.amp, 'melt', 'melt', ''),
    hydro: cmpEq(enemy.cond.amp, 'vaporize', 'vaporize', ''),
    pyro: lookup(enemy.cond.amp, { melt: 'melt', vaporize: 'vaporize' }, ''),
  }, '')),
  selfBuff.prep.cata.add(lookup(self.prep.ele, {
    dendro: cmpEq(enemy.cond.cata, 'spread', 'spread', ''),
    electro: cmpEq(enemy.cond.cata, 'aggravate', 'aggravate', ''),
  }, '')),
]
export default data
