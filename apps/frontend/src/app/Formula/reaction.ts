import KeyMap from '../KeyMap'
import {
  crystallizeLevelMultipliers,
  transformativeReactionLevelMultipliers,
  transformativeReactions,
} from '../KeyMap/StatConstants'
import { absorbableEle } from '../Types/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import { infusionNode, input } from './index'
import {
  constant,
  data,
  equal,
  frac,
  greaterEq,
  infoMut,
  lookup,
  max,
  min,
  naught,
  one,
  percent,
  prod,
  subscript,
  sum,
} from './utils'

const crystallizeMulti1 = subscript(
  input.lvl,
  crystallizeLevelMultipliers,
  KeyMap.info('crystallize_level_multi_')
)
const crystallizeElemas = prod(40 / 9, frac(input.total.eleMas, 1400))
const crystallizeHit = infoMut(
  prod(
    infoMut(sum(one, /** + Crystallize bonus */ crystallizeElemas), {
      pivot: true,
      ...KeyMap.info('base_crystallize_multi_'),
    }),
    crystallizeMulti1
  ),
  KeyMap.info('crystallize')
)

const transMulti1 = subscript(
  input.lvl,
  transformativeReactionLevelMultipliers,
  KeyMap.info('transformative_level_multi')
)
const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
const trans = {
  ...objKeyMap(Object.keys(transformativeReactions), (reaction) => {
    const { multi, resist, canCrit } = transformativeReactions[reaction]
    return infoMut(
      prod(
        prod(constant(multi, KeyMap.info(`${reaction}_multi_`)), transMulti1),
        sum(
          infoMut(sum(one, transMulti2), {
            pivot: true,
            ...KeyMap.info('base_transformative_multi_'),
          }),
          input.total[`${reaction}_dmg_`]
        ),
        lookup(
          input.hit.hitMode,
          {
            hit: one,
            critHit: canCrit
              ? sum(one, input.total[`${reaction}_critDMG_`])
              : one,
            avgHit: canCrit
              ? sum(
                  one,
                  prod(
                    infoMut(
                      max(
                        min(
                          input.total[`${reaction}_critRate_`],
                          sum(one, one)
                        ),
                        naught
                      ),
                      {
                        ...input.total[`${reaction}_critRate_`].info,
                        pivot: true,
                      }
                    ),
                    input.total[`${reaction}_critDMG_`]
                  )
                )
              : one,
          },
          NaN
        ),
        input.enemy.transDef,
        input.enemy[`${resist}_resMulti_`]
      ),
      KeyMap.info(`${reaction}_hit`)
    )
  }),
  swirl: objKeyMap(transformativeReactions.swirl.variants, (ele) => {
    const base = prod(
      prod(
        constant(
          transformativeReactions.swirl.multi,
          KeyMap.info('swirl_multi_')
        ),
        transMulti1
      ),
      sum(
        infoMut(sum(one, transMulti2), {
          pivot: true,
          ...KeyMap.info('base_transformative_multi_'),
        }),
        input.total.swirl_dmg_
      )
    )
    const res = input.enemy[`${ele}_resMulti_`]
    return infoMut(
      // CAUTION:
      // Add amp multiplier/additive term only to swirls that have amp/additive reactions.
      // It is wasteful to add them indiscriminately, but this means
      // that we need to audit and add appropriate elements here
      // should amp/additive reactions be added to more swirls.
      ['pyro', 'hydro', 'cryo', 'electro'].includes(ele)
        ? ele === 'electro'
          ? // Additive reactions apply the additive term before resistance, but after swirl bonuses
            data(prod(sum(base, input.hit.addTerm), res), {
              hit: { ele: constant(ele) },
            })
          : // Amp reaction
            data(prod(base, res, input.hit.ampMulti), {
              hit: { ele: constant(ele) },
            })
        : prod(base, res),
      KeyMap.info(`${ele}_swirl_hit`)
    )
  }),
}
const infusionReactions = {
  overloaded: infoMut(
    greaterEq(
      sum(equal(infusionNode, 'pyro', 1), equal(infusionNode, 'electro', 1)),
      1,
      trans.overloaded
    ),
    KeyMap.info('overloaded_hit')
  ),
  electrocharged: infoMut(
    greaterEq(
      sum(equal(infusionNode, 'hydro', 1), equal(infusionNode, 'electro', 1)),
      1,
      trans.electrocharged
    ),
    KeyMap.info('electrocharged_hit')
  ),
  superconduct: infoMut(
    equal(infusionNode, 'cryo', trans.superconduct),
    KeyMap.info('superconduct_hit')
  ),
  burning: infoMut(
    equal(infusionNode, 'pyro', trans.burning),
    KeyMap.info('burning_hit')
  ),
  bloom: infoMut(
    equal(infusionNode, 'hydro', trans.bloom),
    KeyMap.info('bloom_hit')
  ),
  burgeon: infoMut(
    equal(infusionNode, 'pyro', trans.burgeon),
    KeyMap.info('burgeon_hit')
  ),
  hyperbloom: infoMut(
    equal(infusionNode, 'electro', trans.hyperbloom),
    KeyMap.info('hyperbloom_hit')
  ),
}
export const reactions = {
  anemo: {
    electroSwirl: trans.swirl.electro,
    pyroSwirl: trans.swirl.pyro,
    cryoSwirl: trans.swirl.cryo,
    hydroSwirl: trans.swirl.hydro,
    overloaded: trans.overloaded,
    electrocharged: trans.electrocharged,
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    burning: trans.burning,
    bloom: trans.bloom,
    burgeon: trans.burgeon,
    hyperbloom: trans.hyperbloom,
  },
  geo: {
    crystallize: crystallizeHit,
    ...Object.fromEntries(
      absorbableEle.map((e) => [
        `${e}Crystallize`,
        infoMut(
          prod(percent(2.5), crystallizeHit),
          KeyMap.info(`${e}_crystallize`)
        ),
      ])
    ),
    shattered: trans.shattered,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    superconduct: infusionReactions.superconduct,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
    hyperbloom: infusionReactions.hyperbloom,
  },
  electro: {
    overloaded: trans.overloaded,
    electrocharged: trans.electrocharged,
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    hyperbloom: trans.hyperbloom,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
  },
  hydro: {
    electrocharged: trans.electrocharged,
    shattered: trans.shattered,
    bloom: trans.bloom,
    overloaded: infusionReactions.overloaded,
    superconduct: infusionReactions.superconduct,
    burning: infusionReactions.burning,
    burgeon: infusionReactions.burgeon,
    hyperbloom: infusionReactions.hyperbloom,
  },
  pyro: {
    overloaded: trans.overloaded,
    shattered: trans.shattered,
    burning: trans.burning,
    burgeon: trans.burgeon,
    electrocharged: infusionReactions.electrocharged,
    superconduct: infusionReactions.superconduct,
    bloom: infusionReactions.bloom,
    hyperbloom: infusionReactions.hyperbloom,
  },
  cryo: {
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
    hyperbloom: infusionReactions.hyperbloom,
  },
  dendro: {
    shattered: trans.shattered,
    burning: trans.burning,
    bloom: trans.bloom,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    superconduct: infusionReactions.superconduct,
    burgeon: infusionReactions.burgeon,
    hyperbloom: infusionReactions.hyperbloom,
  },
}
