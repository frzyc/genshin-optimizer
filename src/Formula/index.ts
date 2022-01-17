import { allMainStatKeys, allSubstats } from "../Types/artifact"
import { allArtifactSets, allElementsWithPhy, allHitModes } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import { ConstantNode, Node, ReadNode, StringNode, StringReadNode } from "./type"
import { frac, prod, sum, min, max, read, setReadNodeKeys, stringRead, stringPrio } from "./utils"

const allStats = [...allMainStatKeys, ...allSubstats] as const
const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const unit: ConstantNode = { operation: "const", value: 1, info: { unit: "%" }, operands: [] }

const substatMapping: StrictDict<typeof allStats[number], string> = {
  hp: "HP", hp_: "HP%", atk: "ATK", atk_: "ATK%", def: "DEF", def_: "DEF%",
  eleMas: "Elemental Mastery", enerRech_: "Energy Recharge",
  critRate_: "Crit Rate", critDMG_: "Crit DMG",
  physical_dmg_: "Physical DMG Bonus",
  anemo_dmg_: "Anemo DMG Bonus",
  geo_dmg_: "Geo DMG Bonus",
  electro_dmg_: "Electro DMG Bonus",
  hydro_dmg_: "Hydro DMG Bonus",
  pyro_dmg_: "Pyro DMG Bonus",
  cryo_dmg_: "Cryp DMG Bonus",
  heal_: "Healing Bonus",
}

// All read nodes
const rd = setReadNodeKeys({
  base: objectFromKeyMap(["atk", "hp", "def"] as const, key => read("add", { name: `Base ${substatMapping[key]}` })),
  premod: objectFromKeyMap(allStats, _ => read("add")),
  total: {
    ...objectFromKeyMap(allStats, key => read("add", { name: `${substatMapping[key]}` })),
    cappedCritRate: read("unique"), // Total Crit Rate capped to [0, 100%]
  },

  art: {
    ...objectFromKeyMap(allStats, key => key.endsWith("_")
      ? read("add", { unit: "%", name: `Artifact ${substatMapping[key]}` })
      : read("add", { name: `Artifact ${substatMapping[key]}` })),
    ...objectFromKeyMap(allArtifactSets, _ => read("add")),
  },
  char: {
    key: stringRead(), ele: stringRead(), infusion: stringRead(),

    auto: read("add"), skill: read("add"), burst: read("add"),
    lvl: read("unique"), constellation: read("unique"), asc: read("unique"),

    ...objectFromKeyMap(["hp", "atk", "def"] as const, key => read("unique", { name: `Character ${substatMapping[key]}` })),
    special: read("unique", { name: `Character Bonus` }),
  },
  weapon: {
    key: stringRead(), type: stringRead(),

    lvl: read("unique"), asc: read("unique"), refineIndex: read("unique"),
    main: read("unique"), sub: read("unique"), sub2: read("unique"),
  },
  team: { infusion: stringRead() },

  dmgBonus: {
    total: read("unique"), common: read("add"),
    byMove: read("unique"), byElement: read("unique"),

    ...objectFromKeyMap(allMoves, _ => read("add", { unit: "%" })),
    ...objectFromKeyMap(allElementsWithPhy, _ => read("unique")),
  },

  hit: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),

    dmg: read("unique"), base: read("add"),
    amp: { reactionMulti: read("add"), multi: read("add"), base: read("add"), },
    critMulti: {
      byHitMode: read("unique"),
      ...objectFromKeyMap(allHitModes, _ => read("unique", { unit: "%" }))
    },
  },

  enemy: {
    res: {
      byElement: read("unique"),
      ...objectFromKeyMap(allElementsWithPhy, _ => read("add", { unit: "%" })),
    },
    level: read("unique"),
    def: read("add"),
    defRed: read("add"),
  },
})

// Read nodes with suffixes. Can't add them in the declaration because it's self-referential
rd.dmgBonus.byMove.suffix = rd.hit.move
rd.dmgBonus.byElement.suffix = rd.hit.ele
rd.hit.critMulti.byHitMode.suffix = rd.hit.hitMode
rd.enemy.res.byElement.suffix = rd.hit.ele
for (const element of allElementsWithPhy) {
  rd.enemy.res[element].info!.variant = element
  rd.art[`${element}_dmg_` as const].info!.variant = element
}

const { base, art, premod, total, char, hit, dmgBonus, enemy } = rd

// Mark read nodes whose aggregation we want to hide
for (const node of Object.values(art))
  node.asConst = true
for (const key of ["hp", "atk", "def"] as const)
  char[key].asConst = true
char.special.asConst = true

const common = {
  base: objectFromKeyMap(["hp", "atk", "def"], key => char[key] as Node),
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
  total: {
    ...objectFromKeyMap(allStats, key => premod[key] as Node),
    cappedCritRate: max(min(total.critRate_, unit), 0),
  },

  dmgBonus: {
    total: sum(dmgBonus.common, dmgBonus.byMove, dmgBonus.byElement),
    ...objectFromKeyMap(allElementsWithPhy, ele => total[`${ele}_dmg_`] as Node)
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

    ele: stringPrio(rd.char.infusion, rd.team.infusion),
  },

  enemy: {
    def: frac(sum(char.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed))))
  },
} as const

type _StrictInput<T, Num, Str> = T extends ReadNode ? Num : T extends StringReadNode ? Str : { [key in keyof T]: _StrictInput<T[key], Num, Str> }
type _Input<T, Num, Str> = T extends ReadNode ? Num : T extends StringReadNode ? Str : { [key in keyof T]?: _Input<T[key], Num, Str> }
function typecheck<A, B extends A>() { }

export type StrictInput<Num = Node, Str = StringNode> = _StrictInput<typeof rd, Num, Str>
export type Input<Num = Node, Str = StringNode> = _Input<typeof rd, Num, Str>

// Make sure that `common` contains only entries matching `rd` and `str`.
typecheck<typeof common, StrictInput<Node, StringNode>>()

export {
  rd as input, common
}
