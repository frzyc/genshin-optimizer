import { allMainStatKeys, allSubstats } from "../Types/artifact"
import { allArtifactSets, allElementsWithPhy } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import { ConstantNode, Node, ReadNode, StringNode, StringReadNode } from "./type"
import { frac, prod, sum, min, max, read, setReadNodeKeys, stringRead } from "./utils"

const allStats = [...allMainStatKeys, ...allSubstats] as const
const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const unit: ConstantNode = { operation: "const", value: 1, info: { unit: "%" }, operands: [] }

// All string read nodes
const str = setReadNodeKeys({
  char: objectFromKeyMap(["key", "ele"] as const, _ => stringRead()),
  weapon: objectFromKeyMap(["key", "type"] as const, _ => stringRead()),
  dmg: objectFromKeyMap(["ele", "reaction", "move", "critType"] as const, _ => stringRead()),
})

// All read nodes
const rd = setReadNodeKeys({
  base: objectFromKeyMap(["atk", "def", "hp"] as const, _ => read("add")),
  premod: objectFromKeyMap(allStats, _ => read("add")),
  postmod: objectFromKeyMap(allStats, _ => read("add")),
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
    lvl: read("unique"), constellation: read("unique"), asc: read("unique"),
  },
  weapon: { lvl: read("unique"), asc: read("unique"), refineIndex: read("unique") },

  dmgBonus: {
    total: read("unique"), common: read("add"),
    byMove: read("unique", undefined, str.dmg.move),
    byElement: read("unique", undefined, str.dmg.ele),
    ...objectFromKeyMap(allMoves, _ => read("add")),
    ...objectFromKeyMap(allElementsWithPhy, _ => read("add")),
  },

  hit: {
    dmg: read("unique"), base: read("add"),
    amp: { reactionMulti: read("add"), multi: read("add"), base: read("add"), },
    critValue: {
      byType: read("unique", undefined, str.dmg.critType),
      ...objectFromKeyMap(["base", "crit", "avg"] as const, _ => read("unique"))
    },
  },

  enemy: {
    res: {
      byElement: read("unique", undefined, str.dmg.ele),
      ...objectFromKeyMap(allElementsWithPhy, _ => read("add")),
    },
    level: read("unique"),
    def: read("add"),
    defRed: read("add"),
  },
})

const { base, premod, postmod, total, char, hit, dmgBonus, enemy, weapon } = rd

const common = {
  premod: {
    ...objectFromKeyMap(["atk", "def", "hp"] as const,
      key => prod(base[key], premod[`${key}_` as const])),
    critRate_: { operation: "const", value: 0.05, info: { unit: "%" }, operands: [] } as Node,
    critDMG_: { operation: "const", value: 0.5, info: { unit: "%" }, operands: [] } as Node,
    enerRech_: { operation: "const", value: 1, info: { unit: "%" }, operands: [] } as Node,
  },
  postmod: {
    ...objectFromKeyMap(allStats, key => premod[key] as Node),
  },
  total: {
    ...objectFromKeyMap(allStats, key => postmod[key] as Node),
    cappedCritRate: max(min(postmod.critRate_, unit), 0),
  },

  dmgBonus: {
    total: sum(dmgBonus.common, dmgBonus.byMove, dmgBonus.byElement),
  },

  hit: {
    dmg: prod(
      hit.base,
      sum(unit, dmgBonus.total),
      hit.critValue.byType,
      enemy.def,
      enemy.res.byElement,
      hit.amp.multi),
    critValue: {
      base: unit as Node,
      crit: sum(unit, total.critDMG_),
      avg: sum(unit, prod(total.cappedCritRate, total.critDMG_)),
    },
    amp: {
      multi: prod(hit.amp.reactionMulti, hit.amp.base),
      base: sum(unit, prod(25 / 9, frac(total.eleMas, 1400))),
    },
  },

  enemy: {
    def: frac(sum(char.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed))))
  }
} as const

type DeepPartial<T, Element, NewElement> = T extends Element ? NewElement : { [key in keyof T]?: DeepPartial<T[key], Element, NewElement> }

export type NumInput<T = Node> = DeepPartial<typeof rd, ReadNode, T>
export type StringInput<T = StringNode> = DeepPartial<typeof str, StringReadNode, T>

export {
  rd as input, common, str
}
