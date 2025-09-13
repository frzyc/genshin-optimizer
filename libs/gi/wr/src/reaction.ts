import { objKeyMap, objKeyValMap } from '@genshin-optimizer/common/util'
import type {
  LunarReactionKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { absorbableEle } from '@genshin-optimizer/gi/consts'
import type { CrittableTransformativeReactionsKey } from '@genshin-optimizer/gi/keymap'
import {
  crystallizeLevelMultipliers,
  transformativeReactionLevelMultipliers,
  transformativeReactions,
} from '@genshin-optimizer/gi/keymap'
import { infusionNode, input } from './formula'
import { info } from './info'
import type { Data, NumNode } from './type'
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
  info('crystallize_level_multi_')
)
const crystallizeElemas = prod(40 / 9, frac(input.total.eleMas, 1400))
const crystallizeHit = infoMut(
  prod(
    infoMut(sum(one, /** + Crystallize bonus */ crystallizeElemas), {
      pivot: true,
      ...info('base_crystallize_multi_'),
    }),
    crystallizeMulti1
  ),
  info('crystallize')
)

const transMulti1 = subscript(
  input.lvl,
  transformativeReactionLevelMultipliers,
  info('transformative_level_multi')
)
const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
const trans = {
  ...objKeyMap(Object.keys(transformativeReactions), (reaction) => {
    const { multi, resist, canCrit } = transformativeReactions[reaction]
    return infoMut(
      prod(
        sum(
          prod(
            prod(constant(multi, info(`${reaction}_multi_`)), transMulti1),
            sum(
              infoMut(sum(one, transMulti2), {
                pivot: true,
                ...info('base_transformative_multi_'),
              }),
              input.total[`${reaction}_dmg_`]
            )
          ),
          input.total[`${reaction}_dmgInc`]
        ),
        lookup(
          input.hit.hitMode,
          {
            hit: one,
            critHit: canCrit
              ? sum(
                  one,
                  input.total[
                    `${
                      reaction as CrittableTransformativeReactionsKey
                    }_critDMG_`
                  ]
                )
              : one,
            avgHit: canCrit
              ? sum(
                  one,
                  prod(
                    infoMut(
                      max(
                        min(
                          input.total[
                            `${
                              reaction as CrittableTransformativeReactionsKey
                            }_critRate_`
                          ],
                          one
                        ),
                        naught
                      ),
                      {
                        ...input.total[
                          `${
                            reaction as CrittableTransformativeReactionsKey
                          }_critRate_`
                        ].info,
                        pivot: true,
                      }
                    ),
                    input.total[
                      `${
                        reaction as CrittableTransformativeReactionsKey
                      }_critDMG_`
                    ]
                  )
                )
              : one,
          },
          NaN
        ),
        input.enemy.transDef,
        input.enemy[`${resist}_resMulti_`]
      ),
      info(`${reaction}_hit`)
    )
  }),
  swirl: objKeyMap(transformativeReactions.swirl.variants, (ele) => {
    const base = sum(
      prod(
        prod(
          constant(transformativeReactions.swirl.multi, info('swirl_multi_')),
          transMulti1
        ),
        sum(
          infoMut(sum(one, transMulti2), {
            pivot: true,
            ...info('base_transformative_multi_'),
          }),
          input.total.swirl_dmg_
        )
      ),
      input.total.swirl_dmgInc
    )
    const res = input.enemy[`${ele}_resMulti_`]
    const crit = sum(one, input.total.swirl_critDMG_)
    const avgCrit = sum(
      one,
      prod(
        infoMut(max(min(input.total.swirl_critRate_, one), naught), {
          ...input.total.swirl_critRate_.info,
          pivot: true,
        }),
        input.total.swirl_critDMG_
      )
    )
    const critFactor = lookup(
      input.hit.hitMode,
      {
        critHit: crit,
        avgHit: avgCrit,
        hit: one,
      },
      NaN
    )
    return infoMut(
      // CAUTION:
      // Add amp multiplier/additive term only to swirls that have amp/additive reactions.
      // It is wasteful to add them indiscriminately, but this means
      // that we need to audit and add appropriate elements here
      // should amp/additive reactions be added to more swirls.
      ['pyro', 'hydro', 'cryo', 'electro'].includes(ele)
        ? ele === 'electro'
          ? // Additive reactions apply the additive term before resistance, but after swirl bonuses
            data(prod(sum(base, input.hit.addTerm), critFactor, res), {
              hit: { ele: constant(ele) },
            })
          : // Amp reaction
            data(prod(base, critFactor, res, input.hit.ampMulti), {
              hit: { ele: constant(ele) },
            })
        : prod(base, res),
      info(`${ele}_swirl_hit`)
    )
  }),
  lunarcharged: infoMut(
    lunarDmg(
      constant(
        transformativeReactions.lunarcharged.multi,
        info('lunarcharged_multi_')
      ),
      'reaction',
      'lunarcharged'
    ),
    { path: 'lunarcharged_hit' }
  ),
}
const infusionReactions = {
  overloaded: infoMut(
    greaterEq(
      sum(equal(infusionNode, 'pyro', 1), equal(infusionNode, 'electro', 1)),
      1,
      trans.overloaded
    ),
    info('overloaded_hit')
  ),
  electrocharged: infoMut(
    greaterEq(
      sum(equal(infusionNode, 'hydro', 1), equal(infusionNode, 'electro', 1)),
      1,
      trans.electrocharged
    ),
    info('electrocharged_hit')
  ),
  lunarcharged: infoMut(
    greaterEq(
      sum(equal(infusionNode, 'hydro', 1), equal(infusionNode, 'electro', 1)),
      1,
      trans.lunarcharged
    ),
    info('lunarcharged_hit')
  ),
  superconduct: infoMut(
    equal(infusionNode, 'cryo', trans.superconduct),
    info('superconduct_hit')
  ),
  burning: infoMut(
    equal(infusionNode, 'pyro', trans.burning),
    info('burning_hit')
  ),
  bloom: infoMut(equal(infusionNode, 'hydro', trans.bloom), info('bloom_hit')),
  burgeon: infoMut(
    equal(infusionNode, 'pyro', trans.burgeon),
    info('burgeon_hit')
  ),
  hyperbloom: infoMut(
    equal(infusionNode, 'electro', trans.hyperbloom),
    info('hyperbloom_hit')
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
    lunarcharged: trans.lunarcharged,
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    burning: trans.burning,
    bloom: trans.bloom,
    burgeon: trans.burgeon,
    hyperbloom: trans.hyperbloom,
  },
  geo: {
    crystallize: crystallizeHit,
    ...objKeyValMap(absorbableEle, (e) => [
      `${e}Crystallize`,
      infoMut(prod(percent(2.5), crystallizeHit), info(`${e}_crystallize`)),
    ]),
    shattered: trans.shattered,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    lunarcharged: infusionReactions.lunarcharged,
    superconduct: infusionReactions.superconduct,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
    hyperbloom: infusionReactions.hyperbloom,
  },
  electro: {
    overloaded: trans.overloaded,
    electrocharged: trans.electrocharged,
    lunarcharged: trans.lunarcharged,
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    hyperbloom: trans.hyperbloom,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
  },
  hydro: {
    electrocharged: trans.electrocharged,
    lunarcharged: trans.lunarcharged,
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
    lunarcharged: infusionReactions.lunarcharged,
    superconduct: infusionReactions.superconduct,
    bloom: infusionReactions.bloom,
    hyperbloom: infusionReactions.hyperbloom,
  },
  cryo: {
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    lunarcharged: infusionReactions.lunarcharged,
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
    lunarcharged: infusionReactions.lunarcharged,
    superconduct: infusionReactions.superconduct,
    burgeon: infusionReactions.burgeon,
    hyperbloom: infusionReactions.hyperbloom,
  },
}

export function lunarDmg(
  multiplier: NumNode,
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: LunarReactionKey,
  additional: Data = {}
) {
  const transformative_dmg_ = sum(
    infoMut(sum(percent(1), prod(6, frac(input.total.eleMas, 2000))), {
      pivot: true,
      path: 'base_transformative_multi_',
    }),
    input.total[`${variant}_dmg_`]
  )
  const cappedCritRate_ = infoMut(
    max(
      min(
        sum(
          input.total.critRate_,
          ...(variant === 'lunarbloom'
            ? [input.total.lunarbloom_critRate_]
            : [])
        ),
        one
      ),
      naught
    ),
    {
      ...info('critRate_'),
      prefix: 'total',
      pivot: true,
    }
  )

  const critDMG_ =
    variant === 'lunarcharged'
      ? input.total.critDMG_
      : infoMut(sum(input.total.critDMG_, input.total.lunarbloom_critDMG_), {
          ...input.total.critDMG_.info,
          pivot: true,
        })

  return data(
    prod(
      sum(
        prod(
          multiplier,
          ...lunarDmgMultiplier(base, variant),
          transformative_dmg_,
          infoMut(sum(percent(1), input.total[`${variant}_baseDmg_`]), {
            path: `${variant}_baseDmg_`,
          }),
          sum(percent(1), input.total[`${variant}_specialDmg_`])
        ),
        input.total[`${variant}_dmgInc`]
      ),
      lookup(
        input.hit.hitMode,
        {
          hit: one,
          critHit: sum(one, critDMG_),
          avgHit: sum(one, prod(cappedCritRate_, critDMG_)),
        },
        NaN
      ),
      input.enemy[`${transformativeReactions[variant].resist}_resMulti_`]
    ),
    additional
  )
}

function lunarDmgMultiplier(
  base: 'reaction' | MainStatKey | SubstatKey,
  variant: LunarReactionKey
) {
  if (base === 'reaction') return [transMulti1]
  switch (variant) {
    case 'lunarcharged':
      return [3, input.total[base]]
    case 'lunarbloom':
      return [input.total[base]]
  }
}
