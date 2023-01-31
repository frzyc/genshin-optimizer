import { cmpEq, dynTag, lookup, prod, sum } from '@genshin-optimizer/waverider'
import { convert, Data, enemy, percent, reader, selfBuff, selfTag } from '../util'

const self = convert(selfTag, { et: 'self' })
const { move, ele, amp, cata, trans } = self.prep

const data: Data = [
  reader.withTag({ src: 'prep', prep: 'dmg' }).add(
    dynTag(prod(self.formula.outDmg, self.preDmg.critMulti, enemy.common.inDmg), {
      move, ele, amp, cata
    })),
  reader.withTag({ src: 'prep', prep: 'trans' }).add(
    dynTag(reader.withTag({ src: 'static', prep: null }), {
      ele, trans
    })
  ),
  reader.withTag({ src: 'prep', prep: 'shield' }).add(
    dynTag(prod(self.formula.base, sum(percent(1), self.base.shield_)), {
      ele
    })
  ),
  reader.withTag({ src: 'prep', prep: 'heal' }).add(
    dynTag(prod(self.formula.base, sum(percent(1), self.base.heal_)), {
    })
  ),

  /* `prep` computations has a stricter restriction as it is computed before many
   * of the setups are ready. Most `stats`-related queries are not accessible,
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
  }, ''))
]
export default data
