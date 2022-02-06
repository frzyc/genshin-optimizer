import Artifact from "../Data/Artifacts/Artifact";
import { transformativeReactionLevelMultipliers, transformativeReactions } from "../StatConstants";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character_WR";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { crawlObject, deepClone, layeredAssignment, objectKeyMap, objPathValue } from "../Util/Util";
import { input } from "./index";
import { Data, NumNode, ReadNode, StrNode } from "./type";
import { NodeDisplay, UIData, valueString } from "./uiData";
import { constant, customRead, frac, infoMut, percent, prod, resetData, setReadNodeKeys, subscript, sum, unit } from "./utils";

const asConst = true

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
        id: constant(art.id), set: constant(art.setKey)
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

    premod: {
      auto: constant(char.talent.auto),
      skill: constant(char.talent.skill),
      burst: constant(char.talent.burst),
    },
    enemy: {
      ...objectKeyMap(allElementsWithPhy.map(ele => `${ele}_res_`), ele =>
        percent((char.enemyOverride[`${ele.slice(0, -5)}_enemyRes_`] ?? 10) / 100)),
      level: constant(char.enemyOverride.enemyLevel ?? char.level),
    },
    hit: {
      hitMode: constant(char.hitMode)
    },
    customBonus: {},
  }

  for (const [key, value] of Object.entries(char.bonusStats))
    result.customBonus![key] = key.endsWith('_') ? percent(value / 100) : constant(value)

  if (char.enemyOverride.enemyDefRed_)
    result.enemy!.defRed = percent(char.enemyOverride.enemyDefRed_)
  if (char.enemyOverride.enemyDefIgn_)
    result.enemy!.defIgn = percent(char.enemyOverride.enemyDefIgn_)
  if (char.elementKey) {
    result.charEle = constant(char.elementKey)
    result.display = {
      basic: { [`${char.elementKey}_dmg_`]: input.total[`${char.elementKey}_dmg_`] },
      reaction: reactions[char.elementKey]
    }
    layeredAssignment(result, ["teamBuff", "tally", char.elementKey], constant(1))
  }

  crawlObject(char.conditional, ["conditional"], (x: any) => typeof x === "string", (x: string, keys: string[]) =>
    layeredAssignment(result, keys, constant(x)))
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
/** These read nodes are very context-specific, and cannot be used anywhere else outside of `uiDataForTeam` */
const teamBuff = setReadNodeKeys(deepClone(input), ["teamBuff"]); // Use ONLY by dataObjForTeam
export function uiDataForTeam(teamData: Dict<CharacterKey, Data[]>): Dict<CharacterKey, { target: UIData, buffs: Dict<CharacterKey, UIData> }> {
  // May the goddess of wisdom bless any and all souls courageous
  // enough to attempt for the understanding of this abomination.

  const mergedData = Object.entries(teamData).map(([key, data]) => [key, { ...mergeData(data) }] as [CharacterKey, Data])
  const result = Object.fromEntries(mergedData.map(([key]) =>
    [key, { targetRef: {} as Data, buffs: [] as Data[], calcs: {} as Dict<CharacterKey, Data> }]))

  const customReadNodes = {}
  function getReadNode(path: readonly string[]): ReadNode<number> {
    const base = (path[0] === "teamBuff")
      ? objPathValue(teamBuff, path.slice(1))
      : objPathValue(input, path)
    if (base) return base
    const custom = objPathValue(customReadNodes, path)
    if (custom) return custom
    const newNode = customRead(path)
    if (path[0] === "teamBuff" && path[1] === "tally") newNode.accu = "add"
    layeredAssignment(customReadNodes, path, newNode)
    return newNode
  }

  Object.values(result).forEach(({ targetRef, buffs, calcs }) =>
    mergedData.forEach(([sourceKey, source]) => {
      const sourceBuff = source.teamBuff
      // Create new copy of `calc` as we're mutating it later
      const buff: Data = {}, calc: Data = deepClone({ teamBuff: sourceBuff })
      buffs.push(buff)
      calcs[sourceKey] = calc

      // This construction creates a `Data` representing buff
      // from `source` applying to `target`. It has 3 data:
      // - `target` contains the reference for the final
      //   data. It is not populated at this stage,
      // - `calc` contains the calculation of the buffs,
      // - `buff` contains read nodes that point to the
      //   calculation in `calc`.

      crawlObject(sourceBuff, [], (x: any) => x.operation, (x: NumNode | StrNode, path: string[]) => {
        layeredAssignment(buff, path, resetData(getReadNode(["teamBuff", ...path]), calc))

        crawlObject(x, [], (x: any) => x?.operation === "read", (x: ReadNode<number | string>) => {
          if (x.path[0] === "targetBuff") return // Ignore teamBuff access

          let readNode: ReadNode<number | string> | undefined, data: Data
          if (x.path[0] === "target") { // Link the node to target data
            readNode = getReadNode(x.path.slice(1))
            data = targetRef
          } else { // Link the node to source data
            readNode = x
            data = result[sourceKey].targetRef
          }
          layeredAssignment(calc, x.path, resetData(readNode, data))
        })
      })
    })
  )
  mergedData.forEach(([targetKey, data]) => {
    delete data.teamBuff
    const { targetRef, buffs } = result[targetKey]
    const buff = mergeData(buffs)
    Object.assign(targetRef, mergeData([data, buff, { teamBuff: buff }]))
    targetRef["target"] = targetRef
  })
  const origin = new UIData(undefined as any, undefined)
  const uiDataResult = Object.fromEntries(Object.entries(result).map(([key, value]) =>
    [key, {
      target: new UIData(value.targetRef, origin),
      buff: Object.fromEntries(Object.entries(value.calcs).map(([key, value]) =>
        [key, new UIData(value, origin)]))
    }]))
  return uiDataResult
}
function mergeData(data: Data[]): Data {
  function internal(data: any[], input: any, path: string[]): any {
    if (data.length <= 1) return data[0]
    if (data[0].operation) {
      let accu = (input as ReadNode<number> | undefined)?.accu
      if (accu === undefined) {
        if (path[0] === "tally") {
          accu = "add"
        } else {
          if (data.length !== 1) throw new Error(`Multiple entries when merging \`unique\` for key ${path}`)
          return data[0]
        }
      }
      const result: NumNode = { operation: accu, operands: data, }
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
  ...objectKeyMap(["overloaded", "electrocharged", "superconduct", "shattered"] as const, reaction => {
    const { multi, variants: [ele] } = transformativeReactions[reaction]
    return infoMut(prod(
      infoMut(prod(multi, transMulti1), { asConst }),
      sum(unit, transMulti2, input.total[`${reaction}_dmg_`]),
      input.enemy[`${ele}_resMulti`]),
      { key: `${reaction}_hit`, variant: reaction })
  }),
  swirl: objectKeyMap(transformativeReactions.swirl.variants, ele => infoMut(
    prod(
      infoMut(prod(transformativeReactions.swirl.multi, transMulti1), { asConst }),
      sum(unit, transMulti2, input.total.swirl_dmg_),
      input.enemy[`${ele}_resMulti`]),
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
  mergeData, computeUIData, valueString,
};
