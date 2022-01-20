import { allStatKeys } from "../KeyMap"
import { amplifyingReactions, transformativeReactions } from "../StatConstants"
import { allArtifactSets, allElementsWithPhy, allHitModes } from "../Types/consts"
import { objectFromKeyMap } from "../Util/Util"
import { Node, ReadNode, StringNode, StringReadNode } from "./type"
import { frac, prod, sum, min, max, read, setReadNodeKeys, stringRead, stringPrio, percent, stringMatch, stringConst, todo, lookup } from "./utils"

const allMoves = ["normal", "charged", "plunging", "skill", "burst"] as const
const unit = percent(1), naught = percent(0)
const asConst = true, pivot = true

// All read nodes
const rd = setReadNodeKeys({
  charKey: stringRead(), charEle: stringRead(), infusion: stringRead(),
  weaponType: stringRead(),
  lvl: read("unique"), constellation: read("unique"), asc: read("unique"),

  talent: objectFromKeyMap(["base", "boost", "total"] as const, type =>
    objectFromKeyMap(["auto", "skill", "burst"] as const, _ => read(type === "boost" ? "add" : "unique"))),

  ...objectFromKeyMap(["hp", "atk", "def"] as const, key => read("unique", { key, namePrefix: "Char.", asConst })),
  special: read("unique", { namePrefix: "Char.", asConst }),

  base: objectFromKeyMap(["atk", "hp", "def"] as const, key =>
    read(key === "atk" ? "add" : "unique", { key, namePrefix: "Base", pivot })),
  premod: objectFromKeyMap(allStatKeys, _ => read("add")),
  total: {
    ...objectFromKeyMap(allStatKeys, key => read("add", { key, namePrefix: "Total", pivot })),
    cappedCritRate: read("unique", { key: "critRate_", namePrefix: "Capped" }), // Total Crit Rate capped to [0, 100%]
  },
  art: {
    ...objectFromKeyMap(allStatKeys, key =>
      read("add", { key, namePrefix: "Art.", asConst })),
    ...objectFromKeyMap(allArtifactSets, _ => read("add", { asConst })),
  },

  weapon: {
    key: stringRead(), type: stringRead(),

    lvl: read("unique"), asc: read("unique"), refineIndex: read("unique"),
    main: read("unique", { namePrefix: "Weapon", asConst }),
    sub: read("unique", { namePrefix: "Weapon", asConst }),
    sub2: read("unique", { namePrefix: "Weapon", asConst }),
  },
  team: { infusion: stringRead() },

  dmgBonus: {
    total: read("unique", { key: "dmg_", namePrefix: "Total" }), common: read("add", { key: "dmg_", pivot }),
    ...objectFromKeyMap(allMoves, move => read("add", { key: `${move}_dmg_`, pivot })),
    ...objectFromKeyMap(allElementsWithPhy, ele => read("unique", { key: `${ele}_dmg_`, pivot })),
  },

  hit: {
    ele: stringRead(), reaction: stringRead(), move: stringRead(), hitMode: stringRead(),

    dmg: read("unique"), base: read("add", { key: "base_", pivot }),
    amp: { multi: read("unique"), base: read("add"), },
    critMulti: {
      byHitMode: read("unique"),
      ...objectFromKeyMap(allHitModes, _ => read("unique"))
    },
  },

  enemy: {
    res: objectFromKeyMap(allElementsWithPhy, ele => read("add", { key: `${ele}_enemyRes_` })),
    level: read("unique", { key: "enemyLevel" }),
    def: read("add", { key: "enemyDEF_multi", pivot }),
    defRed: read("add", { key: "enemyDEFRed_" }),
  },

  display: {
    normal: {},
    charged: objectFromKeyMap(["dmg", "spinning", "final", "hit", "full"] as const, _ => read("unique")),
    plunging: objectFromKeyMap(["dmg", "low", "high"] as const, _ => read("unique"))
  }
})

const { base, art, premod, total, hit, dmgBonus, enemy } = rd

for (const element of allElementsWithPhy) {
  art[`${element}_dmg_` as const].info!.variant = element
  art[`${element}_res_` as const].info!.variant = element
  art[`${element}_enemyRes_` as const].info!.variant = element
}
Object.keys(transformativeReactions).map(t => {
  art[`${t}_dmg_` as const].info!.variant = t
})
Object.keys(amplifyingReactions).map(t => {
  art[`${t}_dmg_` as const].info!.variant = t
})

const common = {
  base: objectFromKeyMap(["hp", "atk", "def"], key => rd[key] as Node),
  talent: {
    total: objectFromKeyMap(["auto", "skill", "burst"] as const, talent =>
      sum(rd.talent.base[talent], rd.talent.boost[talent]))
  },
  premod: {
    ...objectFromKeyMap(allStatKeys, key => {
      if (key === "atk" || key === "def" || key === "hp")
        return sum(prod(base[key], sum(unit, premod[`${key}_` as const])), art[key])
      if (key === "critRate_") return sum(percent(0.05), art[key])
      if (key === "critDMG_") return sum(percent(0.5), art[key])
      if (key === "enerRech_") return sum(unit, art[key])
      else return art[key]
    }),
  },
  total: {
    ...objectFromKeyMap(allStatKeys, key => premod[key] as Node),
    cappedCritRate: max(min(total.critRate_, unit), naught),
  },

  dmgBonus: {
    total: sum(dmgBonus.common,
      lookup(hit.move, objectFromKeyMap(allMoves, move => dmgBonus[move])),
      lookup(hit.ele, objectFromKeyMap(allElementsWithPhy, ele => dmgBonus[ele])),
    ),
    ...objectFromKeyMap(allElementsWithPhy, ele => total[`${ele}_dmg_`] as Node)
  },

  hit: {
    dmg: prod(
      hit.base,
      sum(unit, dmgBonus.total),
      hit.critMulti.byHitMode,
      enemy.def,
      lookup(hit.ele,
        objectFromKeyMap(allElementsWithPhy, ele => enemy.res[ele])),
      hit.amp.multi,
    ),
    critMulti: {
      hit: unit as Node,
      critHit: sum(unit, total.critDMG_),
      avgHit: sum(unit, prod(total.cappedCritRate, total.critDMG_)),
      byHitMode: lookup(hit.hitMode, objectFromKeyMap(allHitModes, mode => hit.critMulti[mode])),
    },
    amp: {
      multi: lookup(hit.reaction, {
        melt: lookup(hit.ele, {
          pyro: prod(2, hit.amp.base),
          cryo: prod(1.5, hit.amp.base),
        }, 1, { key: "melt_dmg_" }),
        vaporize: lookup(hit.ele, {
          hydro: prod(2, hit.amp.base),
          pyro: prod(1.5, hit.amp.base),
        }, 1, { key: "vaporize_dmg_" }),
      }, 1),
      base: sum(unit, prod(25 / 9, frac(total.eleMas, 1400))),
    },
    ele: stringPrio(
      rd.infusion,
      rd.team.infusion,
      stringMatch(hit.move, stringConst("charged"), rd.charEle,
        stringMatch(rd.weaponType, stringConst("catalyst"), rd.charEle, stringConst(undefined))
      )
    ),
  },

  enemy: {
    def: frac(sum(rd.lvl, 100), prod(sum(enemy.level, 100), sum(1, prod(-1, enemy.defRed))))
  },
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
