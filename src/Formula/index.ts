import { amplifyingReactions, transformativeReactions } from "../StatConstants"
import { allMainStatKeys, allSubstats } from "../Types/artifact_WR"
import { allArtifactSets, allElements, allElementsWithPhy, allSlotKeys } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import { Node, ReadNode, StringNode, StringReadNode } from "./type"
import { frac, lookup, max, min, naught, percent, prod, read, setReadNodeKeys, stringConst, stringLookup, stringMatch, stringPrio, stringRead, sum, unit } from "./utils"

const allMainSubStats = [...new Set([...allMainStatKeys, ...allSubstats] as const)]
const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const asConst = true, pivot = true

// All read nodes
const rd = setReadNodeKeys({
  charKey: stringRead(), charEle: stringRead(), infusion: stringRead(), weaponType: stringRead(),

  lvl: read("unique", { key: "level", namePrefix: "Char." }),
  constellation: read("unique"),
  asc: read("unique"),

  talent: objectFromKeyMap(["base", "boost", "total", "index"] as const, type =>
    objectFromKeyMap(["auto", "skill", "burst"] as const, _ => read(type === "boost" ? "add" : "unique"))),

  ...objectFromKeyMap(["hp", "atk", "def"] as const, key => read("unique", { key, namePrefix: "Char.", asConst })),
  special: read("unique", { namePrefix: "Char.", asConst }),

  base: objectFromKeyMap(["atk", "hp", "def"] as const, key =>
    read(key === "atk" ? "add" : "unique", { key, namePrefix: "Base" })),
  premod: objectFromKeyMap(allMainSubStats, _ => read("add")),
  total: {
    dmgBonus: {
      hit: read("add"), // Total DMG Bonus
      ...objectFromKeyMap(Object.keys(transformativeReactions), reaction =>
        read("add")),
    },
    ...objectFromKeyMap(allMainSubStats, key => read("add", { key, namePrefix: "Total", pivot })),
    cappedCritRate: read("unique", { key: "critRate_", namePrefix: "Capped" }), // Total Crit Rate capped to [0, 100%]
  },
  art: {
    ...objectFromKeyMap(allMainSubStats, key => read("add", { key, namePrefix: "Art.", asConst })),
    ...objectFromKeyMap(allSlotKeys, _ => ({ id: stringRead(), set: stringRead() })),
  },
  artSet: {
    ...objectFromKeyMap(allArtifactSets, set => read("add", { key: set })),
  },

  weapon: {
    key: stringRead(), type: stringRead(),

    lvl: read("unique"), asc: read("unique"),
    refineIndex: read("unique"), refinement: read("unique"),
    main: read("unique", { namePrefix: "Weapon", asConst }),
    sub: read("unique", { namePrefix: "Weapon", asConst }),
    sub2: read("unique", { namePrefix: "Weapon", asConst }),
  },
  team: { infusion: stringRead() },

  bonus: {
    crit: objectFromKeyMap(allMoves, move => read("add", { key: `${move}_critRate_`, pivot })),
    dmg: {
      common: read("add", { key: "dmg_", namePrefix: "Custom" }),
      ...objectFromKeyMap(Object.keys(transformativeReactions), reaction =>
        read("add", { key: `${reaction}_dmg_`, variant: reaction, namePrefix: "Custom" })),
      ...objectFromKeyMap(Object.keys(amplifyingReactions), reaction =>
        read("add", { key: `${reaction}_dmg_`, variant: reaction, namePrefix: "Custom" })),
      ...objectFromKeyMap(allMoves, move =>
        read("add", { key: `${move}_dmg_`, namePrefix: "Custom" })),
      ...objectFromKeyMap(allElementsWithPhy, ele =>
        read("add", { key: `${ele}_dmg_`, variant: ele, namePrefix: "Custom" })),
    },
    res: objectFromKeyMap(allElementsWithPhy, ele => read("add", { key: `${ele}_res_`, variant: ele })),
  },
  override: {
    enemy: {
      res: objectFromKeyMap(allElementsWithPhy, ele => read("add", { key: `${ele}_enemyRes_`, variant: ele })),
    }
  },

  enemy: {
    res: objectFromKeyMap(allElementsWithPhy, ele => read("add", { key: `${ele}_enemyRes_`, variant: ele })),
    level: read("unique", { key: "enemyLevel" }),
    def: read("add", { key: "enemyDEF_multi", pivot }),
    defRed: read("add", { key: "enemyDEFRed_", pivot }),
  },

  hit: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),
    base: read("add", { key: "base" }),

    dmg: read("unique"), trans: read("unique"),
  },

  misc: objectFromKeyMap([
    "stamina", "incHeal_", "shield_", "cdRed_", "moveSPD_", "atkSPD_", "weakspotDMG_"
  ] as const, key => read("add", { key }))
})

const { base, art, premod, total, hit, enemy, bonus } = rd

// Note:
// We may need to annotate variants on other values as well
// However, since the variants propagate to parent nodes
// We only need to annotate values at the very leafs of the
// computation.
for (const ele of allElementsWithPhy) {
  art[`${ele}_dmg_` as const].info!.variant = ele
}

// Nodes that are not used anywhere else but `common` below

/** Base Amplifying Bonus */
const baseAmpBonus = sum(unit, prod(25 / 9, frac(total.eleMas, 1400)))
/** Effective reaction, taking into account the hit's element */
const effectiveReaction = stringLookup(hit.ele, {
  pyro: stringLookup(hit.reaction, { vaporize: stringConst("vaporize"), melt: stringConst("melt") }),
  hydro: stringMatch(hit.reaction, "vaporize", "vaporize", undefined),
  cryo: stringMatch(hit.reaction, "melt", "melt", undefined),
})

const common = {
  base: objectFromKeyMap(["hp", "atk", "def"], key => rd[key] as Node),
  talent: {
    total: objectFromKeyMap(["auto", "skill", "burst"] as const, talent =>
      sum(rd.talent.base[talent], rd.talent.boost[talent])),
    index: objectFromKeyMap(["auto", "skill", "burst"] as const, talent =>
      sum(rd.talent.total[talent], -1)),
  },
  premod: {
    ...objectFromKeyMap(allMainSubStats, key => {
      if (key === "atk" || key === "def" || key === "hp")
        return sum(prod(base[key], sum(unit, premod[`${key}_` as const])), art[key])
      if (key === "critRate_")
        return sum(percent(0.05), art[key],
          lookup(hit.move, objectFromKeyMap(allMoves, move => bonus.crit[move]), 0))
      if (key === "critDMG_") return sum(percent(0.5), art[key])
      if (key === "enerRech_") return sum(unit, art[key])
      else return art[key]
    }),
  },
  total: {
    dmgBonus: {
      hit: sum(
        bonus.dmg.common,
        lookup(effectiveReaction, objectFromKeyMap([
          ...Object.keys(amplifyingReactions)],
          reaction => bonus.dmg[reaction]), 0),
        lookup(hit.move, objectFromKeyMap(allMoves, move => bonus.dmg[move]), 0),
        lookup(hit.ele, objectFromKeyMap(allElements, ele =>
          sum(bonus.dmg[ele], art[`${ele}_dmg_`])), 0)
      ),
      ...objectFromKeyMap(Object.keys(transformativeReactions), reaction =>
        bonus.dmg[reaction] as Node)
    },
    ...objectFromKeyMap(allMainSubStats, key => premod[key] as Node),
    cappedCritRate: max(min(total.critRate_, unit), naught),
  },

  weapon: {
    refineIndex: sum(rd.weapon.refinement, -1),
  },

  hit: {
    ele: stringPrio(
      rd.infusion,
      rd.team.infusion,
      stringMatch(hit.move, stringConst("charged"), rd.charEle,
        stringMatch(rd.weaponType, stringConst("catalyst"), rd.charEle, stringConst(undefined))
      ),
    ),
    dmg: prod(
      hit.base,
      sum(unit, total.dmgBonus.hit),
      lookup(hit.hitMode, {
        hit: unit,
        critHit: sum(unit, total.critDMG_),
        avgHit: sum(unit, prod(total.critRate_, total.critDMG_)),
      }, undefined),
      enemy.def,
      lookup(hit.ele,
        objectFromKeyMap(allElementsWithPhy, ele => enemy.res[ele]), undefined),
      lookup(effectiveReaction, {
        melt: lookup(hit.ele, {
          pyro: prod(2, baseAmpBonus),
          cryo: prod(1.5, baseAmpBonus),
        }, 1, { key: "melt_dmg_" }),
        vaporize: lookup(hit.ele, {
          hydro: prod(2, baseAmpBonus),
          pyro: prod(1.5, baseAmpBonus),
        }, 1, { key: "vaporize_dmg_" }),
      }, 1),
    ),
  },

  enemy: {
    def: frac(sum(rd.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed))))
  },

  misc: {
    stamina: { operation: "const", operands: [], value: 100 } as Node
  }
} as const

type _StrictInput<T, Num, Str> = T extends ReadNode ? Num : T extends StringReadNode ? Str : { [key in keyof T]: _StrictInput<T[key], Num, Str> }
type _Input<T, Num, Str> = T extends ReadNode ? Num : T extends StringReadNode ? Str : { [key in keyof T]?: _Input<T[key], Num, Str> }
function typecheck<A, B extends A>(): B | void { }

export type StrictInput<Num = Node, Str = StringNode> = _StrictInput<typeof rd, Num, Str>
export type Input<Num = Node, Str = StringNode> = _Input<typeof rd, Num, Str>

// Make sure that `common` contains only entries matching `rd` and `str`.
typecheck<typeof common, StrictInput<Node, StringNode>>()

export {
  rd as input, common
}
