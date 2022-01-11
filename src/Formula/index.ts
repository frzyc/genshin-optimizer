import { hitMoves } from "../StatConstants"
import { allMainStatKeys, allSubstats } from "../Types/artifact"
import { allArtifactSets, allElementsWithPhy, allHitModes } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import { ConstantNode, Node, ReadNode, StringNode, StringReadNode } from "./type"
import { frac, prod, sum, min, max, read, setReadNodeKeys, stringRead, stringPrio } from "./utils"

const allStats = [...allMainStatKeys, ...allSubstats] as const
const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const unit: ConstantNode = { operation: "const", value: 1, info: { unit: "%" }, operands: [] }

// All string read nodes
const str = setReadNodeKeys({
  char: { key: stringRead(), ele: stringRead(), infusion: stringRead() },
  weapon: {
    key: stringRead(), type: stringRead(),
    main: stringRead(), sub: stringRead(), sub2: stringRead(),
  },
  team: { infusion: stringRead() },
  dmg: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),
  },
})

// All read nodes
const rd = setReadNodeKeys({
  base: { atk: read("add"), def: read("add"), hp: read("add") },
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
  weapon: {
    lvl: read("unique"), asc: read("unique"), refineIndex: read("unique"),
    main: read("unique"), sub: read("unique"), sub2: read("unique"),
  },

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
    critMulti: {
      byHitMode: read("unique", undefined, str.dmg.hitMode),
      ...objectFromKeyMap(allHitModes, _ => read("unique"))
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

const { base, art, premod, postmod, total, char, hit, dmgBonus, enemy } = rd

const common = {
  number: {
    premod: {
      ...objectFromKeyMap(allStats, key => {
        if (key === "atk" || key === "def" || key === "hp")
          return sum(prod(base[key], sum(unit, premod[`${key}_` as const])), art[key])
        if (key === "critRate_") return sum(0.05, art[key])
        if (key === "critDMG_") return sum(0.5, art[key])
        if (key === "enerRech_") return sum(1, art[key])
        else return art[key]
      }),
    },
    postmod: objectFromKeyMap(allStats, key => premod[key] as Node),
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
        hit.critMulti.byHitMode,
        enemy.def,
        enemy.res.byElement,
        hit.amp.multi),
      critMulti: {
        hit: unit as Node,
        critHit: sum(unit, total.critDMG_),
        avgHit: sum(unit, prod(total.cappedCritRate, total.critDMG_)),
      },
      amp: {
        multi: prod(hit.amp.reactionMulti, hit.amp.base),
        base: sum(unit, prod(25 / 9, frac(total.eleMas, 1400))),
      },
    },

    enemy: {
      def: frac(sum(char.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed))))
    },
  }, string: {
    dmg: {
      ele: stringPrio(str.char.infusion, str.team.infusion)
    }
  }
} as const

type DeepPartial<T, Element, NewElement> = T extends Element ? NewElement : { [key in keyof T]?: DeepPartial<T[key], Element, NewElement> }

export type NumInput<T = Node> = DeepPartial<typeof rd, ReadNode, T>
export type StringInput<T = StringNode> = DeepPartial<typeof str, StringReadNode, T>

export {
  rd as input, common, str
}

type DeepReplace<T, Element, NewElement> = T extends Element ? NewElement : { [key in keyof T]: DeepReplace<T[key], Element, NewElement> }
function typecheck<A, B extends A>() { }

// Make sure that `common` contains only entries matching `rd`.
typecheck<typeof common["number"], DeepReplace<typeof rd, ReadNode, Node>>()
typecheck<typeof common["string"], DeepReplace<typeof str, StringReadNode, StringNode>>()
