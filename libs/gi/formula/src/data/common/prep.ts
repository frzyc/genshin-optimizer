import {
  cmpEq,
  dynTag,
  lookup,
  prod,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, percent, self, tagVal } from '../util'

const { ele, amp, cata } = self.prep

const data: TagMapNodeEntries = [
  // Formulas
  // If any `prep` nodes are available, put them in `dynTag` or note them here
  self.formula.dmg.add(
    dynTag(prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg), {
      ele,
      amp,
      cata /* `move` is fixed */,
    })
  ),
  self.formula.shield.add(
    prod(self.formula.base, sum(percent(1), self.premod.shield_))
  ),
  self.formula.heal.add(
    prod(self.formula.base, sum(percent(1), self.premod.heal_))
  ),

  // Transformative reactions
  // `prep.trans` and `prep.ele` are fixed on `trans`, `transCrit`, and `swirl`
  self.formula.trans.add(prod(self.trans.multi, self.reaction.transBase)),
  self.formula.transCrit.add(
    prod(self.trans.multi, self.reaction.transBase, self.trans.critMulti)
  ),
  self.formula.swirl.add(
    dynTag(
      prod(
        sum(
          prod(self.trans.multi, self.reaction.transBase),
          self.reaction.cataAddi
        ),
        enemy.common.postRes,
        self.reaction.ampMulti
      ),
      { cata: self.prep.cata, amp: self.prep.amp }
    )
  ),

  /* `prep:` formulas have a stricter restriction as it is computed before most
   * computations are ready. Most `stats`-related queries are not available, and
   * we are essentially limited to other preps and conditionals. If the value is
   * always awailable from the tag, we can use an unrestricted `tagVal` here.
   *
   * Some are outside of this file as it has to be in a util function, but the
   * restriction nonetheless applies.
   */

  self.prep.move.add(tagVal('move')),
  self.prep.trans.add(tagVal('trans')),
  self.prep.amp.add(
    lookup(
      self.prep.ele,
      {
        cryo: cmpEq(enemy.reaction.amp, 'melt', 'melt', ''),
        hydro: cmpEq(enemy.reaction.amp, 'vaporize', 'vaporize', ''),
        pyro: lookup(
          enemy.reaction.amp,
          { melt: 'melt', vaporize: 'vaporize' },
          ''
        ),
      },
      ''
    )
  ),
  self.prep.cata.add(
    lookup(
      self.prep.ele,
      {
        dendro: cmpEq(enemy.reaction.cata, 'spread', 'spread', ''),
        electro: cmpEq(enemy.reaction.cata, 'aggravate', 'aggravate', ''),
      },
      ''
    )
  ),
]
export default data
