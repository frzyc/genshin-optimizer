import { amplifyingReactions, transformativeReactions } from "../StatConstants"
import { allMainStatKeys, allSubstats } from "../Types/artifact_WR"
import { allArtifactSets, allElementsWithPhy, allSlotKeys } from "../Types/consts"
import { deepClone, objectFromKeyMap } from "../Util/Util"
import { Info, NumNode, StrNode, ReadNode } from "./type"
import { frac, lookup, max, min, naught, percent, prod, read, res, setReadNodeKeys, stringPrio, stringRead, sum, constant, unit, match, matchStr } from "./utils"

const allMainSubStats = [...new Set([...allMainStatKeys, ...allSubstats] as const)]
const allElements = allElementsWithPhy
const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const asConst = true as const, pivot = true as const

const customInfo: Info = { namePrefix: "Custom", asConst, pivot }
const charInfo: Info = { namePrefix: "Char.", asConst, pivot }
const artInfo: Info = { namePrefix: "Art.", asConst, pivot }
const weaponInfo: Info = { namePrefix: "Weapon", asConst, pivot }
const totalInfo: Info = { namePrefix: "Tot.", pivot }

/** All custom bonus/override nodes */
const custom = setReadNodeKeys({
  bonus: {
    crit: objectFromKeyMap(allMoves, move => read("add", { ...customInfo, key: `${move}_critRate_` })),
    dmg: {
      common: read("add", { ...customInfo, key: "dmg_" }),
      ...objectFromKeyMap(Object.keys(transformativeReactions), reaction =>
        read("add", { ...customInfo, key: `${reaction}_dmg_`, variant: reaction })),
      ...objectFromKeyMap(Object.keys(amplifyingReactions), reaction =>
        read("add", { ...customInfo, key: `${reaction}_dmg_`, variant: reaction })),
      ...objectFromKeyMap(allMoves, move =>
        read("add", { ...customInfo, key: `${move}_dmg_` })),
      ...objectFromKeyMap(allElements, ele =>
        read("add", { ...customInfo, key: `${ele}_dmg_`, variant: ele })),
    },
    res: objectFromKeyMap(allElements, ele =>
      read("add", { ...customInfo, key: `${ele}_res_`, variant: ele })),
  },
}, ["custom"])

/** All read nodes */
const rd = setReadNodeKeys({
  charKey: stringRead(), charEle: stringRead(), infusion: stringRead(), weaponType: stringRead(),

  lvl: read(undefined, { key: "level" }), constellation: read(undefined), asc: read(undefined),

  talent: objectFromKeyMap(["base", "boost", "total", "index"] as const, type =>
    objectFromKeyMap(["auto", "skill", "burst"] as const, _ => read(type === "boost" ? "add" : undefined))),

  ...objectFromKeyMap(["hp", "atk", "def"] as const, key => read(undefined, { ...charInfo, key, asConst })),
  special: read(undefined, { ...charInfo, asConst }),

  base: objectFromKeyMap(["atk", "hp", "def"] as const, key =>
    read(key === "atk" ? "add" : undefined, { key, namePrefix: "Base", pivot })),
  premod: objectFromKeyMap(allMainSubStats, _ => read("add")),
  total: {
    dmgBonus: {
      hit: read("add", { ...totalInfo, key: "dmg_" }), // Total DMG Bonus
      ...objectFromKeyMap(Object.keys(custom.bonus.dmg), key =>
        read("add", { ...custom.bonus.dmg[key].info, ...totalInfo, })),
    },
    ...objectFromKeyMap(allMainSubStats, key => read("add", { ...totalInfo, key })),
    cappedCritRate: read(undefined, { ...totalInfo, key: "critRate_", namePrefix: "Capped", pivot }), // Total Crit Rate capped to [0%, 100%]
  },

  art: {
    ...objectFromKeyMap(allMainSubStats, key => read("add", { ...artInfo, key })),
    ...objectFromKeyMap(allSlotKeys, _ => ({ id: stringRead(), set: stringRead() })),
  },
  artSet: {
    ...objectFromKeyMap(allArtifactSets, set => read("add", { ...artInfo, key: set })),
  },

  weapon: {
    key: stringRead(), type: stringRead(),

    lvl: read(undefined, { ...weaponInfo }), asc: read(undefined, { ...weaponInfo }),
    refineIndex: read(undefined, { ...weaponInfo }), refinement: read(undefined, { ...weaponInfo }),
    main: read(undefined),
    sub: read(undefined),
    sub2: read(undefined),
  },

  team: { infusion: stringRead() },

  enemy: {
    def: read("add", { key: "enemyDef_multi", pivot }),
    resMulti: objectFromKeyMap(allElements, _ => read(undefined)),

    level: read(undefined, { key: "enemyLevel" }),
    res: objectFromKeyMap(allElements, ele => read("add", { key: `${ele}_enemyRes_`, variant: ele })),
    defRed: read("add", { key: "enemyDefRed_", pivot }),
    defIgn: read("add", { key: "enemyDefIgn_", pivot }),
  },

  hit: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),
    base: read("add", { key: "base" }),

    dmg: read(undefined), trans: read(undefined),
  },

  misc: objectFromKeyMap([
    "stamina", "incHeal_", "shield_", "cdRed_", "moveSPD_", "atkSPD_", "weakspotDMG_"
  ] as const, key => read("add", { key }))
})

const { base, art, premod, total, hit, enemy } = rd

// Note:
// We may need to annotate variants on other values as well
// However, since the variants propagate to parent nodes
// We only need to annotate values at the very leafs of the
// computation.
for (const ele of allElements) {
  art[`${ele}_dmg_` as const].info!.variant = ele
}

// Nodes that are not used anywhere else but `common` below

/** Base Amplifying Bonus */
const baseAmpBonus = sum(unit, prod(25 / 9, frac(total.eleMas, 1400)))
/** Effective reaction, taking into account the hit's element */
export const effectiveReaction = lookup(hit.ele, {
  pyro: lookup(hit.reaction, { vaporize: constant("vaporize"), melt: constant("melt") }, undefined),
  hydro: matchStr(hit.reaction, "vaporize", "vaporize", undefined),
  cryo: matchStr(hit.reaction, "melt", "melt", undefined),
}, undefined)

const common = {
  base: objectFromKeyMap(["hp", "atk", "def"], key => rd[key] as NumNode),
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
          lookup(hit.move, objectFromKeyMap(allMoves, move => custom.bonus.crit[move]), 0))
      if (key === "critDMG_") return sum(percent(0.5), art[key])
      if (key === "enerRech_") return sum(unit, art[key])
      else return art[key]
    }),
  },
  total: {
    dmgBonus: {
      hit: sum(
        total.dmgBonus.common,
        lookup(effectiveReaction, objectFromKeyMap([
          ...Object.keys(amplifyingReactions)],
          reaction => total.dmgBonus[reaction]), naught),
        lookup(hit.move, objectFromKeyMap(allMoves, move => total.dmgBonus[move]), 0),
        lookup(hit.ele, objectFromKeyMap(allElements, ele =>
          sum(total.dmgBonus[ele], art[`${ele}_dmg_`])), 0)
      ),
      ...objectFromKeyMap(Object.keys(custom.bonus.dmg), key =>
        custom.bonus.dmg[key] as NumNode),
    },
    ...objectFromKeyMap(allMainSubStats, key => premod[key] as NumNode),
    cappedCritRate: max(min(total.critRate_, unit), naught),
  },

  hit: {
    ele: stringPrio(
      rd.infusion,
      rd.team.infusion,
      matchStr(hit.move, constant("charged"), rd.charEle,
        matchStr(rd.weaponType, constant("catalyst"), rd.charEle, constant(undefined))
      ),
    ),
    dmg: prod(
      hit.base,
      sum(unit, total.dmgBonus.hit),
      lookup(hit.hitMode, {
        hit: unit,
        critHit: sum(unit, total.critDMG_),
        avgHit: sum(unit, prod(total.cappedCritRate, total.critDMG_)),
      }, NaN),
      enemy.def,
      lookup(hit.ele,
        objectFromKeyMap(allElements, ele => enemy.resMulti[ele]), NaN),
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
    // TODO: shred cap of 90%
    def: frac(sum(rd.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed)), sum(1, prod(-1, enemy.defIgn)))),
    resMulti: objectFromKeyMap(allElements, ele => res(enemy.res[ele])),
  },

  misc: {
    stamina: constant(100)
  }
} as const

type _StrictInput<T, Num, Str> = T extends ReadNode<number> ? Num : T extends ReadNode<string> ? Str : { [key in keyof T]: _StrictInput<T[key], Num, Str> }
type _Input<T, Num, Str> = T extends ReadNode<number> ? Num : T extends ReadNode<string> ? Str : { [key in keyof T]?: _Input<T[key], Num, Str> }
function typecheck<A, B extends A>(): B | void { }

export type StrictInput<Num = NumNode, Str = StrNode> = _StrictInput<typeof rd, Num, Str>
export type Input<Num = NumNode, Str = StrNode> = _Input<typeof rd, Num, Str>
export type Custom<Num = NumNode, Str = StrNode> = _Input<typeof custom, Num, Str>

// Make sure that `common` contains only entries matching `rd` and `str`.
typecheck<typeof common, StrictInput<NumNode, StrNode>>()

const target = setReadNodeKeys(deepClone(rd), ["target"])

export {
  rd as input, common, custom,
  target
}
