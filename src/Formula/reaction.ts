import { crystallizeLevelMultipliers, transformativeReactionLevelMultipliers, transformativeReactions } from "../KeyMap/StatConstants";
import { absorbableEle } from "../Types/consts";
import { objectKeyMap } from "../Util/Util";
import { infusionNode, input } from "./index";
import { constant, data, equal, frac, infoMut, one, percent, prod, subscript, sum } from "./utils";

const crystallizeMulti1 = subscript(input.lvl, crystallizeLevelMultipliers, { key: "crystallize_level_multi" })
const crystallizeElemas = prod(40 / 9, frac(input.total.eleMas, 1400))
const crystallizeHit = infoMut(prod(
  infoMut(sum(one, /** + Crystallize bonus */ crystallizeElemas), { pivot: true, key: "base_crystallize_multi" }),
  crystallizeMulti1),
  { key: "crystallize", variant: "geo" })

const transMulti1 = subscript(input.lvl, transformativeReactionLevelMultipliers, { key: "transformative_level_multi" })
const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
const trans = {
  ...objectKeyMap(Object.keys(transformativeReactions), reaction => {
    const { multi, resist } = transformativeReactions[reaction]
    return infoMut(prod(
      prod(constant(multi, { key: `${reaction}_multi` }), transMulti1),
      sum(
        infoMut(sum(one, transMulti2), { pivot: true, key: "base_transformative_multi" }),
        input.total[`${reaction}_dmg_`]
      ),
      input.enemy[`${resist}_resMulti`]
    ), { key: `${reaction}_hit` })
  }),
  swirl: objectKeyMap(transformativeReactions.swirl.variants, ele => {
    const base = prod(
      prod(constant(transformativeReactions.swirl.multi, { key: "swirl_multi" }), transMulti1),
      sum(infoMut(sum(one, transMulti2), { pivot: true, key: "base_transformative_multi" }), input.total.swirl_dmg_)
    )
    const res = input.enemy[`${ele}_resMulti`]
    return infoMut(
      // CAUTION:
      // Add amp multiplier/additive term only to swirls that have amp/additive reactions.
      // It is wasteful to add them indiscriminately, but this means
      // that we need to audit and add appropriate elements here
      // should amp/additive reactions be added to more swirls.
      ["pyro", "hydro", "cryo", "electro"].includes(ele)
        ? (ele === "electro"
          // Additive reactions apply the additive term before resistance, but after swirl bonuses
          ? data(prod(sum(base, input.hit.addTerm), res), { hit: { ele: constant(ele) } })
          // Amp reaction
          : data(prod(base, res, input.hit.ampMulti), { hit: { ele: constant(ele) } }))
        : prod(base, res),
      { key: `${ele}_swirl_hit` })
  })
}
const infusionReactions = {
  overloaded: equal(infusionNode, "pyro", trans.overloaded, { key: "overloaded_hit" }),
  electrocharged: equal(infusionNode, "hydro", trans.electrocharged, { key: "electrocharged_hit" }),
  superconduct: equal(infusionNode, "cryo", trans.superconduct, { key: "superconduct_hit" }),
  burning: equal(infusionNode, "pyro", trans.burning, { key: "burning_hit" }),
  bloom: equal(infusionNode, "hydro", trans.bloom, { key: "bloom_hit" }),
  burgeon: equal(infusionNode, "pyro", trans.burgeon, { key: "burgeon_hit" }),
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
    ...Object.fromEntries(absorbableEle.map(e => [`${e}Crystallize`,
    infoMut(prod(percent(2.5), crystallizeHit), { key: `${e}_crystallize`, variant: e })])),
    shattered: trans.shattered,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    superconduct: infusionReactions.superconduct,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
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
  },
  pyro: {
    overloaded: trans.overloaded,
    shattered: trans.shattered,
    burning: trans.burning,
    burgeon: trans.burgeon,
    electrocharged: infusionReactions.electrocharged,
    superconduct: infusionReactions.superconduct,
    bloom: infusionReactions.bloom,
  },
  cryo: {
    superconduct: trans.superconduct,
    shattered: trans.shattered,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    burning: infusionReactions.burning,
    bloom: infusionReactions.bloom,
    burgeon: infusionReactions.burgeon,
  },
  dendro: {
    shattered: trans.shattered,
    burning: trans.burning,
    bloom: trans.bloom,
    overloaded: infusionReactions.overloaded,
    electrocharged: infusionReactions.electrocharged,
    superconduct: infusionReactions.superconduct,
    burgeon: infusionReactions.burgeon,
  }
}
