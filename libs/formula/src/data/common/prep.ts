import { cmpEq, dynTag, lookup, prod, sum, tag } from '@genshin-optimizer/waverider'
import { Data, enemy, percent, reader, self, selfBuff, Tag } from '../util'

const { move, ele, amp, cata, trans } = self.prep
const preparedTag: Tag = { prep: null }

const data: Data = [
  reader.withTag({ et: 'prep', prep: 'dmg' }).add(
    dynTag(tag(prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg), preparedTag), {
      move, ele, amp, cata
    })),
  reader.withTag({ et: 'prep', prep: 'trans' }).add(
    dynTag(tag(prod(self.dmg.out, self.trans.critMulti, enemy.common.inDmg), preparedTag), {
      ele, trans
    })
  ),
  reader.withTag({ et: 'prep', prep: 'shield' }).add(
    dynTag(tag(prod(self.formula.base, sum(percent(1), self.base.shield_)), preparedTag), {
      ele
    }),
  ),
  reader.withTag({ et: 'prep', prep: 'heal' }).add(
    // No `prep` needed for `prep:heal`
    tag(prod(self.formula.base, sum(percent(1), self.base.heal_)), preparedTag)
  ),

  /* `prep` computations have a stricter restriction as it is computed before many
  * of the computations are ready. Most `stats`-related queries are not available,
   * and we are essentially limited to other preps and conditionals.
   *
   * Some are outside of this file as it has to be in a util function, but the
   * restriction nonetheless applies.
   */

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
