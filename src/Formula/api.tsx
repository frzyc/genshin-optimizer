import Artifact from "../Artifact/Artifact";
import { transformativeReactionLevelMultipliers, transformativeReactions } from "../StatConstants";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character_WR";
import { allElementsWithPhy, ArtifactSetKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { crawlObject, layeredAssignment, objectFromKeyMap } from "../Util/Util";
import { input } from "./index";
import { constant } from "./internal";
import { Data, DisplaySub, Node, ReadNode } from "./type";
import { NodeDisplay, UIData, valueString } from "./uiData";
import { frac, infoMut, percent, prod, stringConst, subscript, sum, unit } from "./utils";

function dataObjForArtifactSheet(
  key: ArtifactSetKey,
  data: Data = {},
  displayArtifact: DisplaySub = {},
): Data {

  return mergeData([data, {
    display: {
      [`artifact:${key}`]: displayArtifact
    },
  }])
}
function dataObjForArtifact(art: ICachedArtifact, mainStatAssumptionLevel: number = 0): Data {
  const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level))
  const stats: [ArtifactSetKey | MainStatKey | SubstatKey, number][] = []
  stats.push([art.mainStatKey, mainStatVal])
  art.substats.forEach(({ key, value }) => key && stats.push([key, value]))
  return {
    art: {
      ...Object.fromEntries(stats.map(([key, value]) =>
        key.endsWith("_") ? [key, percent(value / 100)] : [key, constant(value)])),
      [art.slotKey]: {
        id: stringConst(art.id), set: stringConst(art.setKey)
      },
    },
    artSet: {
      [art.setKey]: constant(1)
    }
  }
}
function dataObjForCharacter(char: ICachedCharacter): Data {
  const result: Data = {
    lvl: constant(char.level),
    constellation: constant(char.constellation),
    asc: constant(char.ascension),

    talent: {
      base: {
        auto: constant(char.talent.auto),
        skill: constant(char.talent.skill),
        burst: constant(char.talent.burst),
      }
    },
    enemy: {
      res: {
        ...objectFromKeyMap(allElementsWithPhy, ele => {
          return percent(char.enemyOverride[`${ele}_enemyRes_`] ?? 0.1)
        }),
      },
      level: constant(char.enemyOverride.enemyLevel ?? char.level),
    },
    hit: {
      hitMode: stringConst(char.hitMode)
    }
  }
  if (char.enemyOverride.enemyDefRed_)
    result.enemy!.defRed = percent(char.enemyOverride.enemyDefRed_)
  if (char.enemyOverride.enemyDefIgn_)
    result.enemy!.defIgn = percent(char.enemyOverride.enemyDefIgn_)
  if (char.elementKey) {
    result.charEle = stringConst(char.elementKey)
    result.display = {
      reaction: reactions[char.elementKey]
    }
  }

  crawlObject(char.conditional, ["conditional"], (x: any) => typeof x === "string", (x: string, keys: string[]) =>
    layeredAssignment(result, keys, stringConst(x)))
  return result
}
function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    weapon: {
      lvl: constant(weapon.level),
      asc: constant(weapon.ascension),
      refinement: constant(weapon.refinement),
      refineIndex: constant(weapon.refinement - 1)
    },
  }
}
function mergeData(data: Data[]): Data {
  function internal(data: any[], input: any, path: string[]): any {
    if (data.length <= 1) return data[0]
    if (data[0].operation) {
      const accumulation = (input as ReadNode | undefined)?.accumulation ?? "unique"
      if (accumulation === "unique") {
        if (data.length !== 1) throw new Error(`Multiple entries when merging \`unique\` for key ${path}`)
        return data[0]
      }
      const result: Node = { operation: accumulation, operands: data, }
      return result
    } else {
      return Object.fromEntries([...new Set(data.flatMap(x => Object.keys(x) as string[]))]
        .map(key => [key, internal(data.map(x => x[key]).filter(x => x), input?.[key], [...path, key])]))
    }
  }

  return data.length ? internal(data, input, []) : {}
}

function computeUIData(data: Data[]): UIData {
  return new UIData(mergeData(data), undefined)
}

const transMulti1 = subscript(input.lvl, transformativeReactionLevelMultipliers)
const transMulti2 = prod(16, frac(input.total.eleMas, 2000))
const trans = {
  ...objectFromKeyMap(["overloaded", "electrocharged", "superconduct", "shattered"] as const, reaction => {
    const { multi, variants: [ele] } = transformativeReactions[reaction]
    return infoMut(prod(
      infoMut(prod(multi, transMulti1), { asConst: true }),
      sum(unit, prod(transMulti2, input.total.dmgBonus[reaction])),
      input.enemy.resMulti[ele]),
      { key: `${reaction}_hit`, variant: reaction })
  }),
  swirl: objectFromKeyMap(transformativeReactions.swirl.variants, ele => infoMut(
    prod(
      infoMut(prod(transformativeReactions.swirl.multi, transMulti1), { asConst: true }),
      sum(unit, prod(transMulti2, input.total.dmgBonus.swirl)),
      input.enemy.resMulti[ele]),
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
    // TODO: crystallize
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

export type { NodeDisplay, UIData };
export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  dataObjForArtifactSheet,

  mergeData, computeUIData, valueString,
};
