import { allMainStatKeys, allSubstats } from "../Types/artifact_WR"
import { allArtifactSets, allElementsWithPhy, allSlotKeys } from "../Types/consts"
import { crawlObject, deepClone, objectFromKeyMap } from "../Util/Util"
import { Data, Info, Input, NumNode, ReadNode, StrNode } from "./type"
import { constant, frac, lookup, matchStr, max, min, naught, percent, prod, read, res, setReadNodeKeys, stringPrio, stringRead, sum, unit } from "./utils"

const allMainSubStats = [...new Set([...allMainStatKeys, ...allSubstats] as const)]
const allNonDmgMainSubStats = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "critRate_", "critDMG_", "heal_"] as const
const allTransformative = ["overloaded", "shattered", "electrocharged", "superconduct", "swirl"] as const
const allAmplifying = ["vaporize", "melt"] as const
const allElements = allElementsWithPhy
const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const asConst = true as const, pivot = true as const
const allTalents = ["auto", "skill", "burst"] as const
const allDmgBonuses = ["common", ...allTransformative, ...allAmplifying, ...allMoves] as const

const talent = objectFromKeyMap(allTalents, _ => read())

const mainSubStatNodes = objectFromKeyMap(allMainSubStats, key => read(undefined, { key }))

const dmgBonus = objectFromKeyMap(allDmgBonuses, key =>
  read(undefined, { key: `${key}_dmg_` as const }))
const suffixedDmgBonusNodes = objectFromKeyMap(allDmgBonuses.map(x => `${x}_dmg_` as const), key =>
  read(undefined, { key }))
const suffixedResBonusNodes = objectFromKeyMap(allElements.map(x => `${x}_res_` as const), key =>
  read(undefined, { key }))
const suffixedCritRateBonusNodes = objectFromKeyMap(allMoves.map(x => `${x}_critRate_` as const), key =>
  read(undefined, { key }))

dmgBonus.common.info!.key = "dmg_"
suffixedDmgBonusNodes.common_dmg_.info!.key = "dmg_"
for (const ele of allElements) {
  mainSubStatNodes[`${ele}_dmg_`].info!.variant = ele
  suffixedResBonusNodes[`${ele}_res_`].info!.variant = ele
}
for (const reaction of [...allTransformative, ...allAmplifying]) {
  dmgBonus[reaction].info!.variant = reaction
  suffixedDmgBonusNodes[`${reaction}_dmg_`].info!.variant = reaction
}

function withDefaultInfo<T>(info: Info, value: T): T {
  value = deepClone(value)
  crawlObject(value, [], (x: any) => x.operation, (x: NumNode | StrNode) => x.info = { ...info, ...x.info, })
  return value
}
function markAccu<T>(accu: ReadNode<number>["accu"], value: T): T {
  value = deepClone(value)
  crawlObject(value, [], (x: any) => x.operation, (x: ReadNode<number | string>) => x.accu = accu)
  return value
}

/** All read nodes */
const input = setReadNodeKeys(deepClone({
  charKey: stringRead(), charEle: stringRead(), infusion: stringRead(), weaponType: stringRead(),
  lvl: read(), constellation: read(), asc: read(), special: read(),

  /** Stats from character & weapon */
  base: objectFromKeyMap(['atk', 'hp', 'def'], key => read("add", { key, namePrefix: "Base", pivot })),
  /** Custom stat bonuses */
  customBonus: markAccu('add', withDefaultInfo({ namePrefix: "Custom", pivot }, {
    ...mainSubStatNodes,
    ...suffixedDmgBonusNodes,
    ...suffixedResBonusNodes,
    ...suffixedCritRateBonusNodes,
  })),
  bonus: markAccu('add', { talent }),
  /** Stage 1 stats */
  premod: markAccu('add', { talent, dmgBonus, ...mainSubStatNodes }),
  /** Stage 2 stats */
  total: withDefaultInfo({ namePrefix: "Total", pivot }, {
    talent, dmgBonus: markAccu('add', dmgBonus),
    ...markAccu('add', mainSubStatNodes),
    /** Total Crit Rate capped to [0%, 100%] */
    cappedCritRate: read(undefined, { key: "critRate_", namePrefix: "Capped" }),
  }),

  art: withDefaultInfo({ namePrefix: "Art.", asConst }, {
    ...markAccu('add', mainSubStatNodes),
    ...objectFromKeyMap(allSlotKeys, _ => ({ id: stringRead(), set: stringRead() })),
  }),
  artSet: objectFromKeyMap(allArtifactSets, set => read("add", { key: set })),

  weapon: withDefaultInfo({ namePrefix: "Weapon", asConst }, {
    key: stringRead(), type: stringRead(),

    lvl: read(), asc: read(), refinement: read(), refineIndex: read(),
    main: read(), sub: read(), sub2: read(),
  }),

  team: { infusion: stringRead() },

  enemy: {
    def: read("add", { key: "enemyDef_multi", pivot }),
    resMulti: objectFromKeyMap(allElements, _ => read()),

    level: read(undefined, { key: "enemyLevel" }),
    res: objectFromKeyMap(allElements, ele => read("add", { key: `${ele}_enemyRes_`, variant: ele })),
    defRed: read("add", { key: "enemyDefRed_", pivot }),
    defIgn: read("add", { key: "enemyDefIgn_", pivot }),
  },

  hit: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),
    base: read("add", { key: "base" }),

    dmgBonus: read(), dmg: read(),
  },

  misc: objectFromKeyMap([
    "stamina", "staminaDec_", "staminaSprintDec_", "staminaGlidingDec_", "staminaChargedDec_",
    "incHeal_", "shield_", "cdRed_", "moveSPD_", "atkSPD_", "weakspotDMG_"
  ] as const, key => read("add", { key }))
}))

const { base, bonus, customBonus, premod, total, art, hit, enemy } = input

crawlObject(premod, [], (x: any) => x.operation, (x: NumNode | StrNode) => delete x.info)

// Nodes that are not used anywhere else but `common` below

/** Base Amplifying Bonus */
const baseAmpBonus = sum(unit, prod(25 / 9, frac(total.eleMas, 1400)))
/** Effective reaction, taking into account the hit's element */
export const effectiveReaction = lookup(hit.ele, {
  pyro: lookup(hit.reaction, { vaporize: constant("vaporize"), melt: constant("melt") }, undefined),
  hydro: matchStr(hit.reaction, "vaporize", "vaporize", undefined),
  cryo: matchStr(hit.reaction, "melt", "melt", undefined),
}, undefined)

const common: Data = {
  premod: {
    talent: objectFromKeyMap(allTalents, talent => bonus.talent[talent]),
    dmgBonus: objectFromKeyMap(allDmgBonuses, key => customBonus[`${key}_dmg_` as const]),
    ...objectFromKeyMap(allMainSubStats, stat => {
      const operands: NumNode[] = []

      switch (stat) {
        case "atk": case "def": case "hp":
          operands.push(prod(base[stat], premod[`${stat}_` as const]))
          break
        case "critRate_":
          operands.push(percent(0.05),
            lookup(hit.move, objectFromKeyMap(allMoves, move => customBonus[`${move}_critRate_`]), 0)
          )
          break
        case "critDMG_":
          operands.push(percent(0.5))
          break
      }
      return sum(...[...operands, base[stat], art[stat], customBonus[stat]].filter(x => x))
    }),
  },
  total: {
    talent: objectFromKeyMap(allTalents, talent => premod.talent[talent]),
    dmgBonus: objectFromKeyMap(allDmgBonuses, key => premod.dmgBonus[key]),
    ...objectFromKeyMap(allMainSubStats, stat => premod[stat]),
    cappedCritRate: max(min(total.critRate_, unit), naught),
  },

  hit: {
    dmgBonus: sum(
      total.dmgBonus.common,
      lookup(effectiveReaction, objectFromKeyMap(allAmplifying, reaction => total.dmgBonus[reaction]), naught),
      lookup(hit.move, objectFromKeyMap(allMoves, move => total.dmgBonus[move]), naught),
      lookup(hit.ele, objectFromKeyMap(allElements, ele => total.dmgBonus[ele]), naught)
    ),
    ele: stringPrio(
      input.infusion,
      input.team.infusion,
      matchStr(hit.move, "charged",
        matchStr(input.weaponType, "catalyst", input.charEle, undefined),
        undefined,
      ),
      "physical",
    ),
    dmg: prod(
      hit.base,
      sum(unit, hit.dmgBonus),
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
    def: frac(sum(input.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed)), sum(1, prod(-1, enemy.defIgn)))),
    resMulti: objectFromKeyMap(allElements, ele => res(enemy.res[ele])),
  },

  misc: {
    stamina: constant(100)
  }
}

const target = setReadNodeKeys(deepClone(input), ["target"])
const teamBuff = setReadNodeKeys(deepClone(input), ["teamBuff"]); // Use ONLY by dataObjForTeam
(input as any).teamBuff = teamBuff
const dynamic = setReadNodeKeys(deepClone({ dyn: { ...input.art, ...input.artSet } }))
const dynamicData: Input = {
  art: objectFromKeyMap(allMainSubStats, key => dynamic.dyn[key]),
  artSet: objectFromKeyMap(allArtifactSets, key => dynamic.dyn[key])
}

export {
  input, common, customBonus,

  target, teamBuff,
  dynamicData,
}
