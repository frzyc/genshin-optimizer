import { tagVal } from '@genshin-optimizer/gameOpt/engine'
import {
  cmpEq,
  dynTag,
  lookup,
  prod,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, own, ownBuff, percent } from '../util'

const { ele, amp, cata } = own.prep

const data: TagMapNodeEntries = [
  // Formulas
  // If any `prep` nodes are available, put them in `dynTag` or note them here
  ownBuff.formula.dmg.add(
    dynTag(prod(own.dmg.out, own.dmg.critMulti, own.dmg.inDmg), {
      ele,
      amp,
      cata /* `move` is fixed */,
    })
  ),
  ownBuff.formula.shield.add(
    prod(own.formula.base, sum(percent(1), own.premod.shield_))
  ),
  ownBuff.formula.heal.add(
    prod(own.formula.base, sum(percent(1), own.premod.heal_))
  ),

  // Transformative reactions
  // `prep.trans` and `prep.ele` are fixed on `trans`, `transCrit`, and `swirl`
  ownBuff.formula.trans.add(prod(own.trans.multi, own.reaction.transBase)),
  ownBuff.formula.transCrit.add(
    prod(own.trans.multi, own.reaction.transBase, own.trans.critMulti)
  ),
  ownBuff.formula.swirl.add(
    dynTag(
      prod(
        sum(
          prod(own.trans.multi, own.reaction.transBase),
          own.reaction.cataAddi
        ),
        enemy.common.postRes,
        own.reaction.ampMulti
      ),
      { cata: own.prep.cata, amp: own.prep.amp }
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

  ownBuff.prep.move.add(tagVal('move')),
  ownBuff.prep.trans.add(tagVal('trans')),
  ownBuff.prep.amp.add(
    lookup(
      own.prep.ele,
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
  ownBuff.prep.cata.add(
    lookup(
      own.prep.ele,
      {
        dendro: cmpEq(enemy.reaction.cata, 'spread', 'spread', ''),
        electro: cmpEq(enemy.reaction.cata, 'aggravate', 'aggravate', ''),
      },
      ''
    )
  ),
]
export default data
