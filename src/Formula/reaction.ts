import { infusionNode } from "../Data/Characters/dataUtil";
import { crystallizeLevelMultipliers, transformativeReactionLevelMultipliers, transformativeReactions } from "../KeyMap/StatConstants";
import { absorbableEle, ElementKey } from "../Types/consts";
import { objectKeyMap } from "../Util/Util";
import { input } from "./index";
import { NumNode } from "./type";
import { compareEq, constant, data, equal, frac, infoMut, one, percent, prod, subscript, sum } from "./utils";

const crystallizeMulti1 = subscript(input.lvl, crystallizeLevelMultipliers, { key: "crystallize_level_multi" })
const crystallizeElemas = prod(40 / 9, frac(input.total.eleMas, 1400))
const crystallizeHit = prod(
  infoMut(sum(one, /** + Crystallize bonus */ crystallizeElemas), { pivot: true, key: "base_crystallize_multi" }),
  crystallizeMulti1
)

const transMulti1 = subscript(input.lvl, transformativeReactionLevelMultipliers, { key: "transformative_level_multi" })
const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
const trans = {
  ...objectKeyMap(Object.keys(transformativeReactions), reaction => {
    const { multi, resist } = transformativeReactions[reaction]
    return prod(
      prod(constant(multi, { key: `${reaction}_multi` }), transMulti1),
      sum(
        infoMut(sum(one, transMulti2), { pivot: true, key: "base_transformative_multi" }),
        input.total[`${reaction}_dmg_`]
      ),
      input.enemy[`${resist}_resMulti`]
    )
  }),
  swirl: objectKeyMap(transformativeReactions.swirl.variants, ele => {
    const base = prod(
      prod(constant(transformativeReactions.swirl.multi, { key: "swirl_multi" }), transMulti1),
      sum(infoMut(sum(one, transMulti2), { pivot: true, key: "base_transformative_multi" }), input.total.swirl_dmg_)
    )
    const res = input.enemy[`${ele}_resMulti`]
    // CAUTION:
    // Add amp multiplier/additive term only to swirls that have amp/additive reactions.
    // It is wasteful to add them indiscriminately, but this means
    // that we need to audit and add appropriate elements here
    // should amp/additive reactions be added to more swirls.
    return ["pyro", "hydro", "cryo", "electro"].includes(ele)
      ? (ele === "electro"
        // Additive reactions apply the additive term before resistance, but after swirl bonuses
        ? data(prod(sum(base, input.hit.addTerm), res), { hit: { ele: constant(ele) } })
        // Amp reaction
        : data(prod(base, res, input.hit.ampMulti), { hit: { ele: constant(ele) } }))
      : prod(base, res)
  })
}
export function getReactions(charElement: ElementKey) {
  return {
    electroSwirl: infoMut(
      checkCharEleAndInfusion(charElement, ["anemo"], trans.swirl.electro)
      , { key: "electro_swirl_hit" }
    ),
    pyroSwirl: infoMut(
      checkCharEleAndInfusion(charElement, ["anemo"], trans.swirl.pyro),
      { key: "pyro_swirl_hit" }
    ),
    cryoSwirl: infoMut(
      checkCharEleAndInfusion(charElement, ["anemo"], trans.swirl.cryo),
      { key: "cryo_swirl_hit" }
    ),
    hydroSwirl: infoMut(
      checkCharEleAndInfusion(charElement, ["anemo"], trans.swirl.hydro),
      { key: "hydro_swirl_hit" }
    ),
    overloaded: infoMut(
      checkCharEleAndInfusion(charElement, ["pyro", "electro", "anemo"], trans.overloaded),
      { key: "overloaded_hit" }
    ),
    electrocharged: infoMut(
      checkCharEleAndInfusion(charElement, ["hydro", "electro", "anemo"], trans.electrocharged),
      { key: "electrocharged_hit" }
    ),
    superconduct: infoMut(
      checkCharEleAndInfusion(charElement, ["cryo", "electro", "anemo"], trans.superconduct),
      { key: "superconduct_hit" }
    ),
    shattered: infoMut(trans.shattered, { key: "shattered_hit" }),
    burning: infoMut(
      checkCharEleAndInfusion(charElement, ["pyro", "dendro", "anemo"], trans.burning),
      { key: "burning_hit" }
    ),
    bloom: infoMut(
      checkCharEleAndInfusion(charElement, ["hydro", "dendro", "anemo"], trans.bloom),
      { key: "bloom_hit" }
    ),
    burgeon: infoMut(
      checkCharEleAndInfusion(charElement, ["pyro", "anemo"], trans.burgeon),
      { key: "burgeon_hit" }
    ),
    hyperbloom: infoMut(
      checkCharEleAndInfusion(charElement, ["electro", "anemo"], trans.hyperbloom),
      { key: "hyperbloom_hit" }
    ),
    crystallize: infoMut(
      checkCharEleAndInfusion(charElement, ["geo"], crystallizeHit), { key: "crystallize" }),
    ...Object.fromEntries(absorbableEle.map(e => [
      `${e}Crystallize`,
      infoMut(
        checkCharEleAndInfusion(charElement, ["geo", e], prod(percent(2.5), crystallizeHit)),
        { key: `${e}_crystallize`, variant: e })
    ])),
  }
}

function checkCharEleAndInfusion(charElement: ElementKey, elementsToMatch: ElementKey[], node: NumNode): NumNode {
  if (elementsToMatch.length === 1) {
    return compareEq(elementsToMatch[0], charElement,
      node,
      equal(infusionNode, elementsToMatch[0], node)
    )
  }

  const n = checkCharEleAndInfusion(charElement, elementsToMatch.slice(1), node)
  return compareEq(elementsToMatch[0], charElement,
    node,
    compareEq(infusionNode, elementsToMatch[0], node, n)
  )
}
