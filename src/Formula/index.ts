import { allEleEnemyResKeys } from "../KeyMap"
import { allArtifactSets, allElementsWithPhy, allRegions, allSlotKeys } from "../Types/consts"
import { crawlObject, deepClone, objectKeyMap, objectKeyValueMap } from "../Util/Util"
import { Data, Info, NumNode, ReadNode, StrNode } from "./type"
import { constant, equalStr, frac, infoMut, lookup, max, min, naught, percent, prod, read, res, setReadNodeKeys, stringRead, sum, unit } from "./utils"

const asConst = true as const, pivot = true as const

const allElements = allElementsWithPhy
const allTalents = ["auto", "skill", "burst"] as const
const allMoves = ["normal", "charged", "plunging", "skill", "burst", "elemental"] as const
const allArtModStats = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_"] as const
const allArtNonModStats = ["physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "heal_"] as const
const allTransformative = ["overloaded", "shattered", "electrocharged", "superconduct", "swirl"] as const
const allAmplifying = ["vaporize", "melt"] as const
const allMisc = [
  "stamina", "staminaDec_", "staminaSprintDec_", "staminaGlidingDec_", "staminaChargedDec_",
  "incHeal_", "shield_", "cdRed_", "moveSPD_", "atkSPD_", "weakspotDMG_", "dmgRed_"
] as const

const allModStats = [
  ...allArtModStats,
  ...(["all", "burning", ...allTransformative, ...allAmplifying, ...allMoves] as const).map(x => `${x}_dmg_` as const),
]
const allNonModStats = [
  ...allArtNonModStats,
  ...(["all", ...allMoves] as const).map(x => `${x}_dmgInc` as const),
  ...([...allElements] as const).map(x => `${x}_critDMG_` as const),
  ...([...allMoves] as const).map(x => `${x}_critDMG_` as const),
  ...allElements.map(x => `${x}_res_` as const),
  ...allMoves.map(x => `${x}_critRate_` as const),
  ...allEleEnemyResKeys,
  "enemyDefRed_" as const,
  ...allMisc,
]

const talent = objectKeyMap(allTalents, _ => read())
const allModStatNodes = objectKeyMap(allModStats, key => read(undefined, { key }))
const allNonModStatNodes = objectKeyMap(allNonModStats, key => read(undefined, { key }))

for (const ele of allElements) {
  allNonModStatNodes[`${ele}_res_`].info!.variant = ele
  allNonModStatNodes[`${ele}_enemyRes_`].info!.variant = ele
  allNonModStatNodes[`${ele}_critDMG_`].info!.variant = ele
  allNonModStatNodes[`${ele}_dmg_`].info!.variant = ele
}
for (const reaction of [...allTransformative, ...allAmplifying]) {
  allModStatNodes[`${reaction}_dmg_`].info!.variant = reaction
}

function withDefaultInfo<T>(info: Info, value: T): T {
  value = deepClone(value)
  crawlObject(value, [], (x: any) => x.operation, (x: NumNode | StrNode) => x.info = { ...info, ...x.info, })
  return value
}
function markAccu<T>(accu: ReadNode<number>["accu"], value: T): void {
  crawlObject(value, [], (x: any) => x.operation, (x: NumNode | StrNode) => {
    if (x.operation === "read" && x.type === "number") x.accu = accu
  })
}

/** All read nodes */
const input = setReadNodeKeys(deepClone({
  activeCharKey: stringRead(),
  charKey: stringRead(), charEle: stringRead(), infusion: stringRead(), weaponType: stringRead(),
  lvl: read(undefined, { key: "level", prefix: "char" }), constellation: read(), asc: read(), special: read(),

  base: objectKeyMap(['atk', 'hp', 'def'], key => read("add", { key })),
  customBonus: withDefaultInfo({ prefix: "custom", pivot }, {
    ...allModStatNodes, ...allNonModStatNodes,
  }),
  bonus: { ...talent },
  premod: { ...talent, ...allModStatNodes, ...allNonModStatNodes },
  total: withDefaultInfo({ prefix: "total", pivot }, {
    ...talent, ...objectKeyValueMap(allTalents, talent => [`${talent}Index`, read()]),
    ...allModStatNodes, ...allNonModStatNodes,
    /** Total Crit Rate capped to [0%, 100%] */
    cappedCritRate: read(undefined, { key: "critRate_" }),
  }),

  art: withDefaultInfo({ prefix: "art", asConst }, {
    ...objectKeyMap(allArtModStats, key => allModStatNodes[key]),
    ...objectKeyMap(allArtNonModStats, key => allNonModStatNodes[key]),
    ...objectKeyMap(allSlotKeys, _ => ({ id: stringRead(), set: stringRead() })),
  }),
  artSet: objectKeyMap(allArtifactSets, set => read("add", { key: set })),

  weapon: withDefaultInfo({ prefix: "weapon", asConst }, {
    key: stringRead(), type: stringRead(),

    lvl: read(), asc: read(), refinement: read(), refineIndex: read(),
    main: read(), sub: read(), sub2: read(),
  }),

  team: { infusion: stringRead("prio") },

  enemy: {
    def: read("add", { key: "enemyDef_multi", pivot }),
    ...objectKeyMap(allElements.map(ele => `${ele}_resMulti` as const), _ => read()),

    level: read(undefined, { key: "enemyLevel" }),
    ...objectKeyValueMap(allElements, ele => [`${ele}_res_`, read(undefined)]),
    defRed: read(undefined),
    defIgn: read("add", { key: "enemyDefIgn_", pivot }),
  },

  hit: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),
    base: read("add", { key: "base" }),

    dmgBonus: read(undefined, { key: "dmg_", pivot }),
    dmgInc: read(undefined, { key: "dmgInc", pivot }),
    dmg: read(),
  },
}))

const { base, bonus, customBonus, premod, total, art, hit, enemy } = input

// Adjust `info` for printing
markAccu('add', {
  bonus, customBonus, premod, art,
  total: objectKeyMap(allModStats, stat => total[stat]),
})
bonus.auto.info = { key: "autoBoost" }
bonus.skill.info = { key: "skillBoost" }
bonus.burst.info = { key: "burstBoost" }
base.atk.info = { key: "atk", prefix: "base", pivot }
delete total.critRate_.info!.pivot
total.critRate_.info!.prefix = "uncapped"

// Nodes that are not used anywhere else but `common` below

/** Base Amplifying Bonus */
const baseAmpBonus = sum(unit, prod(25 / 9, frac(total.eleMas, 1400)))
/** Effective reaction, taking into account the hit's element */
export const effectiveReaction = lookup(hit.ele, {
  pyro: lookup(hit.reaction, { pyro_vaporize: constant("vaporize"), pyro_melt: constant("melt") }, undefined),
  hydro: equalStr(hit.reaction, "hydro_vaporize", "vaporize"),
  cryo: equalStr(hit.reaction, "cryo_melt", "melt"),
}, undefined)

const common: Data = {
  premod: {
    ...objectKeyMap(allTalents, talent => bonus[talent]),
    ...objectKeyMap(allNonModStats, key => customBonus[key]),
    ...objectKeyMap([...allModStats, ...allArtNonModStats] as const, key => {
      const operands: NumNode[] = []
      switch (key) {
        case "atk": case "def": case "hp":
          operands.push(prod(base[key], sum(unit, premod[`${key}_`])))
          break
        case "critRate_":
          operands.push(percent(0.05, { key, prefix: "default" }),
            lookup(hit.move, objectKeyMap(allMoves, move => premod[`${move}_critRate_`]), 0))
          break
        case "critDMG_":
          operands.push(percent(0.5, { key, prefix: "default" }),
            lookup(hit.ele, objectKeyMap(allElements, ele => premod[`${ele}_critDMG_`]), 0),
            lookup(hit.move, objectKeyMap(allMoves, ele => premod[`${ele}_critDMG_`]), 0))
          break
        case "enerRech_":
          operands.push(percent(1, { key, prefix: "default" }))
          break
      }
      return sum(...[...operands, art[key], customBonus[key]].filter(x => x))
    }),
  },
  total: {
    ...objectKeyMap(allTalents, talent => premod[talent]),
    ...objectKeyMap(allModStats, key => premod[key]),
    ...objectKeyMap(allNonModStats, key => premod[key]),
    ...objectKeyValueMap(allTalents, talent => [`${talent}Index`, sum(total[talent], -1)]),
    stamina: sum(constant(100, { key: "stamina", prefix: "default" }), customBonus.stamina),

    cappedCritRate: max(min(total.critRate_, unit), naught),
  },

  hit: {
    dmgBonus: sum(
      total.all_dmg_,
      lookup(effectiveReaction, objectKeyMap(allAmplifying, reaction => total[`${reaction}_dmg_`]), naught),
      lookup(hit.move, objectKeyMap(allMoves, move => total[`${move}_dmg_`]), naught),
      lookup(hit.ele, objectKeyMap(allElements, ele => total[`${ele}_dmg_`]), naught)
    ),
    dmgInc: sum(
      total.all_dmgInc,
      lookup(hit.move, objectKeyMap(allMoves, move => total[`${move}_dmgInc`]), NaN)
    ),
    dmg: prod(
      sum(hit.base, hit.dmgInc),
      sum(unit, hit.dmgBonus),
      lookup(hit.hitMode, {
        hit: unit,
        critHit: sum(unit, total.critDMG_),
        avgHit: sum(unit, prod(total.cappedCritRate, total.critDMG_)),
      }, NaN),
      enemy.def,
      lookup(hit.ele,
        objectKeyMap(allElements, ele => enemy[`${ele}_resMulti` as const]), NaN),
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
    def: frac(sum(input.lvl, 100), prod(sum(enemy.level, 100), sum(unit, prod(-1, enemy.defRed)), sum(unit, prod(-1, enemy.defIgn)))),
    defRed: total.enemyDefRed_,
    ...objectKeyValueMap(allElements, ele =>
      [`${ele}_resMulti`, res(infoMut(sum(enemy[`${ele}_res_`], total[`${ele}_enemyRes_`]), { key: `${ele}_res_`, variant: ele }))]),
  },
}

const target = setReadNodeKeys(deepClone(input), ["target"])
const tally = setReadNodeKeys(objectKeyMap([...allElements, ...allRegions], _ => read("add")), ["tally"])

/**
 * List of `input` nodes, rearranged to conform to the needs of the
 * UI code. This is a separate list so that the evolution of the UIs
 * does not rely on the structure of `input`. So the UI code can rearrange
 * nodes as it sees fit without requiring updates to data sheets, which
 * pertains ~90% of all `input`-related code, and so are very sensitive
 * to any changes to `input`. For zero overhead, use the nodes directly
 * from `input` instead of a copy.
 */
const uiInput = input

export {
  input, uiInput, common, customBonus,

  target, tally,
}
