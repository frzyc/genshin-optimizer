import { transformativeReactionLevelMultipliers } from "../StatConstants"
import { allMainStatKeys, allSubstats } from "../Types/artifact"
import { allArtifactSets, allElementsWithPhy } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import type { ConstantNode, Data, ReadNode } from "./type"
import { frac, prod, res, subscript, sum, min, max, read, setReadNodeKeys, stringRead } from "./utils"

const allStats = [...allMainStatKeys, ...allSubstats] as const
const unit: ConstantNode = { operation: "const", value: 1, info: { unit: "%" }, operands: [] }

// All string read nodes
const str = setReadNodeKeys({
  character: stringRead(),
  weaponType: stringRead(),
  dmg: {
    element: stringRead(),
    reaction: stringRead(),
    move: stringRead(),
    critType: stringRead(),
  }
})

// All read nodes
const rd = setReadNodeKeys({
  base: objectFromKeyMap(["atk", "def", "hp"] as const, _ => read("add")),
  premod: objectFromKeyMap(allStats, _ => read("add")),
  postmod: { ...objectFromKeyMap(allStats, _ => read("add")), },
  total: {
    ...objectFromKeyMap(allStats, _ => read("add")),
    cappedCritRate: read("unique"),
  },

  art: {
    ...objectFromKeyMap(allStats, _ => read("add")),
    ...objectFromKeyMap(allArtifactSets, _ => read("add")),
  },
  char: {
    auto: read("add"), skill: read("add"), burst: read("add"),
    level: read("unique"), constellation: read("unique"), ascension: read("unique"),
  },
  weapon: { level: read("unique"), rank: read("unique"), },

  hit: {
    base: read("add"),
    dmgBonus: read("add"),
    amp: { reactionMulti: read("add"), multi: read("add"), base: read("add"), },
    critValue: {
      byType: read("unique", undefined, str.dmg.critType),
    },
  },

  trans: {
    dmg: read("add"),
    reactionMulti: read("unique"),
    base: read("add"),
    lvlMulti: read("unique"),
  },
  enemy: {
    res: { byElement: read("unique", undefined, str.dmg.element), },
    level: read("unique"),
    def: read("add"),
    defRed: read("add"),
  },
})

const { base, premod, total, char, hit, trans, enemy, } = rd

const common = {
  premod: objectFromKeyMap(["atk", "def", "hp"] as const,
    key => prod(base[key], premod[`${key}_` as const])),
  postmod: {
    ...objectFromKeyMap(allStats, key => premod[key]),
    cappedCritRate: max(min(total.critRate_, unit), 0),
  },

  trans: {
    dmg: prod(trans.reactionMulti, trans.base, trans.lvlMulti, enemy.res.byElement),
    base: sum(unit, prod(16, frac(total.eleMas, 2000))),
    lvlMulti: subscript(char.level, transformativeReactionLevelMultipliers),
  },

  hit: {
    dmg: prod(
      hit.base,
      sum(unit, hit.dmgBonus),
      hit.critValue.byType,
      enemy.def,
      enemy.res.byElement,
      hit.amp.multi),
    critValue: {
      base: unit,
      dmg: sum(unit, total.critDMG_),
      avg: sum(unit, prod(total.cappedCritRate, total.critDMG_)),
    },
    amp: {
      multi: prod(hit.amp.reactionMulti, hit.amp.base),
      base: sum(unit, prod(25 / 9, frac(total.eleMas, 1400))),
    },
  },

  enemy: {
    def: frac(sum(char.level, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed))))
  }
} as const

export {
  rd as input, common
}
