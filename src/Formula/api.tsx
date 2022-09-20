import Artifact from "../Data/Artifacts/Artifact";
import { ICachedArtifact, MainStatKey, SubstatKey } from "../Types/artifact";
import { ICachedCharacter } from "../Types/character";
import { allElementsWithPhy, ArtifactSetKey, CharacterKey } from "../Types/consts";
import { ICachedWeapon } from "../Types/weapon";
import { crawlObject, deepClone, layeredAssignment, objectKeyMap, objectMap, objPathValue } from "../Util/Util";
import { input } from "./index";
import { Data, DisplaySub, Info, Input, NumNode, ReadNode, StrNode } from "./type";
import { NodeDisplay, UIData } from "./uiData";
import { constant, customRead, data, infoMut, none, percent, prod, resetData, setReadNodeKeys, sum } from "./utils";

const asConst = true as const, pivot = true as const

function inferInfoMut(data: Data, source?: Info["source"]): Data {
  crawlObject(data, [], (x: any) => x.operation, (x: NumNode, path: string[]) => {
    if (path[0] === "teamBuff") {
      path = path.slice(1)
      if (!x.info) x.info = {}
      x.info.isTeamBuff = true
    }
    const reference = objPathValue(input, path) as ReadNode<number> | undefined
    if (reference)
      x.info = { ...x.info, ...reference.info, prefix: undefined, source }
    else if (path[0] !== "tally")
      console.error(`Detect ${source} buff into non-existant key path ${path}`)
  })

  return data
}
function dataObjForArtifact(art: ICachedArtifact, mainStatAssumptionLevel: number = 0): Data {
  const mainStatVal = Artifact.mainStatValue(art.mainStatKey, art.rarity, Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level))
  const stats: [ArtifactSetKey | MainStatKey | SubstatKey, number][] = []
  stats.push([art.mainStatKey, mainStatVal])
  art.substats.forEach(({ key, accurateValue }) => key && stats.push([key, accurateValue]))
  return {
    art: {
      ...Object.fromEntries(stats.map(([key, value]) =>
        key.endsWith("_") ? [key, percent(value / 100)] : [key, constant(value)])),
      [art.slotKey]: {
        id: constant(art.id), set: constant(art.setKey)
      },
    },
    artSet: {
      [art.setKey]: constant(1),
    },
  }
}
// when sheetData is supplied, then it is assumed that the data is in "Custom Multi-target" mode
function dataObjForCharacter(char: ICachedCharacter, sheetData?: Data): Data {
  const result: Data = {
    lvl: constant(char.level),
    constellation: constant(char.constellation),
    asc: constant(char.ascension),
    infusion: {
      team: char.infusionAura ? constant(char.infusionAura) : undefined,
    },
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
      hitMode: constant(char.hitMode),
      reaction: constant(char.reaction),
    },
    customBonus: {},
  }

  for (const [key, value] of Object.entries(char.bonusStats))
    result.customBonus![key] = key.endsWith('_') ? percent(value / 100) : constant(value)

  if (char.enemyOverride.enemyDefRed_)
    result.premod!.enemyDefRed_ = percent(char.enemyOverride.enemyDefRed_ / 100)
  if (char.enemyOverride.enemyDefIgn_)
    result.enemy!.defIgn = percent(char.enemyOverride.enemyDefIgn_ / 100)

  crawlObject(char.conditional, ["conditional"], (x: any) => typeof x === "string", (x: string, keys: string[]) =>
    layeredAssignment(result, keys, constant(x)))

  if (sheetData?.display) {
    sheetData.display.custom = {}
    const customMultiTarget = char.customMultiTarget
    customMultiTarget.forEach(({ name, targets }, i) => {
      const targetNodes = targets.map(({ weight, path, hitMode, reaction, infusionAura, bonusStats }) => {
        const targetNode = objPathValue(sheetData.display, path) as NumNode | undefined
        if (!targetNode) return constant(0)

        return prod(
          constant(weight),
          infoMut(data(targetNode, {
            premod: objectMap(bonusStats, (v, k) => k.endsWith('_') ? percent(v / 100) : constant(v)),
            hit: {
              hitMode: constant(hitMode),
              reaction: reaction ? constant(reaction) : none,
            },
            infusion: {
              team: infusionAura ? constant(infusionAura) : none,
            }
          }), { pivot: true })
        )
      })
      // Make the variant "invalid" because its not easy to determine variants in multitarget
      const multiTargetNode = infoMut(sum(...targetNodes), { key: name, variant: "invalid" })
      sheetData.display!.custom[i] = multiTargetNode
    })
  }
  return result
}
function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    weapon: {
      id: constant(weapon.id),
      lvl: constant(weapon.level),
      asc: constant(weapon.ascension),
      refinement: constant(weapon.refinement),
      refineIndex: constant(weapon.refinement - 1)
    },
  }
}
/** These read nodes are very context-specific, and cannot be used anywhere else outside of `uiDataForTeam` */
const teamBuff = setReadNodeKeys(deepClone(input), ["teamBuff"]); // Use ONLY by dataObjForTeam
function uiDataForTeam(teamData: Dict<CharacterKey, Data[]>, activeCharKey?: CharacterKey): Dict<CharacterKey, { target: UIData, buffs: Dict<CharacterKey, UIData> }> {
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
        const info: Info = { ...objPathValue(input, path), source: sourceKey, prefix: undefined, asConst }
        layeredAssignment(buff, path, resetData(getReadNode(["teamBuff", ...path]), calc, info))

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
    crawlObject(buff ?? {}, [], (x => x.operation), (x: NumNode, path: string[]) => {
      // CAUTION
      // This is safe only because `buff` is created using only `resetData`
      // and `mergeData`. So every node here is created from either of the
      // two functions, so the mutation wont't affect existing nodes.
      x.info = { ...(objPathValue(teamBuff, path) as ReadNode<number> | undefined)?.info, prefix: "teamBuff", pivot }
    })
    Object.assign(targetRef, mergeData([data, buff, { teamBuff: buff, activeCharKey: constant(activeCharKey) }]))
    targetRef["target"] = targetRef
  })
  const origin = new UIData(undefined as any, undefined)
  return Object.fromEntries(Object.entries(result).map(([key, value]) =>
    [key, {
      target: new UIData(value.targetRef, origin),
      buffs: Object.fromEntries(Object.entries(value.calcs).map(([key, value]) =>
        [key, new UIData(value, origin)]))
    }]))
}
function mergeData(data: Data[]): Data {
  function internal(data: any[], path: string[]): any {
    if (data.length <= 1) return data[0]
    if (data[0].operation) {
      if (path[0] === "teamBuff") path = path.slice(1)
      let { accu, type } = (objPathValue(input, path) as ReadNode<number> | ReadNode<string> | undefined) ?? {}
      if (path[0] === "tally") accu = "add"
      else if (accu === undefined) {
        const errMsg = `Multiple entries when merging \`unique\` for key ${path}`
        if (process.env.NODE_ENV === "development")
          throw new Error(errMsg)
        else
          console.error(errMsg)

        accu = type === "number" ? "max" : "small"
      }
      const result: NumNode | StrNode = { operation: accu, operands: data }
      return result
    } else {
      return Object.fromEntries([...new Set(data.flatMap(x => Object.keys(x) as string[]))]
        .map(key => [key, internal(data.map(x => x[key]).filter(x => x), [...path, key])]))
    }
  }
  return data.length ? internal(data, []) : {}
}

function computeUIData(data: Data[]): UIData {
  return new UIData(mergeData(data), undefined)
}
type ComparedNodeDisplay<V = number> = NodeDisplay<V> & { diff: V }
function compareTeamBuffUIData(uiData1: UIData, uiData2: UIData): Input<ComparedNodeDisplay, ComparedNodeDisplay<string>> {
  return compareInternal(uiData1.getTeamBuff(), uiData2.getTeamBuff())
}
function compareDisplayUIData(uiData1: UIData, uiData2: UIData): { [key: string]: DisplaySub<ComparedNodeDisplay> } {
  return compareInternal(uiData1.getDisplay(), uiData2.getDisplay())
}
function compareInternal(data1: any | undefined, data2: any | undefined): any {
  if (data1?.operation || data2?.operation) {
    const d1 = data1 as NodeDisplay | undefined
    const d2 = data2 as NodeDisplay | undefined

    if ((d1 && !d1.operation) || (d2 && !d2.operation))
      throw new Error("Unmatched structure when comparing UIData")

    const result: ComparedNodeDisplay = {
      info: {},
      operation: true,
      value: 0,
      isEmpty: true,
      unit: d2?.unit!,
      formulas: [],
      ...d1,
      diff: (d2?.value ?? 0) - (d1?.value ?? 0)
    }
    if (typeof d1?.value === "string" || typeof d2?.value === "string") {
      // In case `string` got involved, just use the other value
      result.value = d1?.value ?? "" as any
      result.diff = d2?.value ?? "" as any
    }
    return result
  }

  if (data1 || data2) {
    const keys = new Set([...Object.keys(data1 ?? {}), ...Object.keys(data2 ?? {})])
    return Object.fromEntries([...keys].map(key => [key, compareInternal(data1?.[key], data2?.[key])]))
  }
}

export type { NodeDisplay, UIData };
export {
  dataObjForArtifact, dataObjForCharacter, dataObjForWeapon,
  mergeData, computeUIData, inferInfoMut,
  uiDataForTeam, compareTeamBuffUIData, compareDisplayUIData
};
