import { crystalizeLevelMultipliers, transformativeReactionLevelMultipliers, transformativeReactions } from "../StatConstants";
import { objectKeyMap } from "../Util/Util";
import { input } from "./index";
import { frac, infoMut, prod, subscript, sum, unit } from "./utils";

const asConst = true as const

const crystalizeMulti1 = subscript(input.lvl, crystalizeLevelMultipliers)
const crystalizeElemas = prod(4000 / 9, frac(input.total.eleMas, 1400))
const crystalizeHit = infoMut(prod(sum(unit, /** + Crystalize bonus */ crystalizeElemas), crystalizeMulti1), { /** Crystalize Shield HP */ })

const transMulti1 = subscript(input.lvl, transformativeReactionLevelMultipliers)
const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
const trans = {
  ...objectKeyMap(["overloaded", "electrocharged", "superconduct", "shattered"] as const, reaction => {
    const { multi, variants: [ele] } = transformativeReactions[reaction]
    return infoMut(prod(
      infoMut(prod(multi, transMulti1), { asConst }),
      sum(unit, transMulti2, input.total[`${reaction}_dmg_`]),
      input.enemy[`${ele}_resMulti`]),
      { key: `${reaction}_hit`, variant: reaction })
  }),
  swirl: objectKeyMap(transformativeReactions.swirl.variants, ele => infoMut(
    prod(
      infoMut(prod(transformativeReactions.swirl.multi, transMulti1), { asConst }),
      sum(unit, transMulti2, input.total.swirl_dmg_),
      input.enemy[`${ele}_resMulti`]),
    { key: `${ele}_swirl_hit`, variant: ele }))
}
export const reactions = {
  anemo: {
    electroSwirl: trans.swirl.electro,
    pyroSwirl: trans.swirl.pyro,
    cryoSwirl: trans.swirl.cryo,
    hydroSwirl: trans.swirl.hydro,
    shattered: trans.shattered,
  },
  geo: {
    ...objectKeyMap(["pyro", "electro", "cryo", "hydro"] as const, _ =>
      prod(2.5, crystalizeHit)),
    shattered: trans.shattered,
  },
  electro: {
    overloaded: trans.overloaded,
    electrocharged: trans.electrocharged,
    superconduct: trans.superconduct,
    shattered: trans.shattered,
  },
  hydro: {
    electrocharged: trans.electrocharged,
    shattered: trans.shattered,
  },
  pyro: {
    overloaded: trans.overloaded,
    shattered: trans.shattered,
  },
  cryo: {
    superconduct: trans.superconduct,
    shattered: trans.shattered,
  },
}
