import {
  crawlObject,
  layeredAssignment,
  objKeyMap,
  objMap,
  objPathValue,
  toDecimal,
} from '@genshin-optimizer/common/util'
import type {
  ArtifactSetKey,
  CharacterKey,
  GenderKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type {
  ICachedArtifact,
  ICachedCharacter,
  ICachedWeapon,
  Team,
  TeamCharacter,
} from '@genshin-optimizer/gi/db'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import { input, tally } from './index'
import { deepNodeClone } from './internal'
import type { Data, DisplaySub, Info, NumNode, ReadNode, StrNode } from './type'
import type { NodeDisplay } from './uiData'
import { UIData } from './uiData'
import {
  constant,
  customRead,
  data,
  infoMut,
  none,
  percent,
  prod,
  resetData,
  setReadNodeKeys,
  sum,
} from './utils'
const asConst = true as const,
  pivot = true as const

function inferInfoMut(data: Data, source?: Info['source']): Data {
  crawlObject(
    data,
    [],
    (x: any) => x.operation,
    (x: NumNode, path: string[]) => {
      if (path[0] === 'teamBuff') {
        path = path.slice(1)
        if (!x.info) x.info = {}
        x.info.isTeamBuff = true
      }
      const reference = objPathValue(input, path) as
        | ReadNode<number>
        | undefined
      if (reference)
        x.info = { ...x.info, ...reference.info, prefix: undefined, source }
      else if (path[0] !== 'tally')
        console.error(
          `Detect ${source} buff into non-existant key path ${path}`
        )
    }
  )

  return data
}
function dataObjForArtifact(
  art: ICachedArtifact,
  mainStatAssumptionLevel = 0
): Data {
  const mainStatVal = getMainStatValue(
    art.mainStatKey,
    art.rarity,
    Math.max(Math.min(mainStatAssumptionLevel, art.rarity * 4), art.level)
  )
  const stats: [ArtifactSetKey | MainStatKey | SubstatKey, number][] = []
  stats.push([art.mainStatKey, mainStatVal])
  art.substats.forEach(
    ({ key, accurateValue }) =>
      key && stats.push([key, toDecimal(accurateValue, key)])
  )
  return {
    art: {
      ...Object.fromEntries(
        stats.map(([key, value]) => [
          key,
          key.endsWith('_') ? percent(value) : constant(value),
        ])
      ),
      [art.slotKey]: {
        id: constant(art.id),
        set: constant(art.setKey),
      },
    },
    artSet: {
      [art.setKey]: constant(1),
    },
  }
}

/**
 * Only used for calculating character-specific. do not use for team.
 */
function dataObjForCharacter(char: ICachedCharacter): Data {
  const result: Data = {
    lvl: constant(char.level),
    constellation: constant(char.constellation),
    asc: constant(char.ascension),
    infusion: {
      team: undefined,
    },
    premod: {
      auto: constant(char.talent.auto),
      skill: constant(char.talent.skill),
      burst: constant(char.talent.burst),
    },
    enemy: {
      ...objKeyMap(
        allElementWithPhyKeys.map((ele) => `${ele}_res_`),
        () => percent(10 / 100)
      ),
      level: constant(100),
    },
    hit: {
      hitMode: constant('avgHit'),
    },
    customBonus: {},
  }
  return result
}

export interface CharInfo extends ICharacter {
  infusionAura: TeamCharacter['infusionAura']
  customMultiTargets: TeamCharacter['customMultiTargets']
  conditional: TeamCharacter['conditional'] & Team['conditional']
  bonusStats: TeamCharacter['bonusStats']
  enemyOverride: Team['enemyOverride']
  hitMode: TeamCharacter['hitMode']
  reaction: TeamCharacter['reaction']
}
/**
 * when sheetData is supplied, then it is assumed that the data is in "Custom Multi-target" mode
 */
export function dataObjForCharacterNew(
  {
    level,
    constellation,
    ascension,
    talent,

    infusionAura,
    customMultiTargets,
    conditional,
    bonusStats,
    enemyOverride,
    hitMode: globalHitMode,
    reaction,
  }: CharInfo,
  sheetData?: Data
): Data {
  const result: Data = {
    lvl: constant(level),
    constellation: constant(constellation),
    asc: constant(ascension),
    infusion: {
      team: infusionAura ? constant(infusionAura) : undefined,
    },
    premod: {
      auto: constant(talent.auto),
      skill: constant(talent.skill),
      burst: constant(talent.burst),
    },
    enemy: {
      ...objKeyMap(
        allElementWithPhyKeys.map((ele) => `${ele}_res_`),
        (ele) =>
          percent((enemyOverride[`${ele.slice(0, -5)}_enemyRes_`] ?? 10) / 100)
      ),
      level: constant(enemyOverride.enemyLevel ?? level),
    },
    hit: {
      hitMode: constant(globalHitMode),
      reaction: constant(reaction),
    },
    customBonus: {},
  }

  for (const [key, value] of Object.entries(bonusStats))
    result.customBonus![key] = key.endsWith('_')
      ? percent(value / 100)
      : constant(value)

  if (enemyOverride.enemyDefRed_)
    result.premod!.enemyDefRed_ = percent(enemyOverride.enemyDefRed_ / 100)
  if (enemyOverride.enemyDefIgn_)
    result.enemy!.defIgn = percent(enemyOverride.enemyDefIgn_ / 100)

  crawlObject(
    conditional,
    ['conditional'],
    (x: any) => typeof x === 'string',
    (x: string, keys: string[]) => layeredAssignment(result, keys, constant(x))
  )

  if (sheetData?.display) {
    sheetData.display.custom = {}
    customMultiTargets.forEach(({ name, targets }, i) => {
      const targetNodes = targets.map(
        ({ weight, path, hitMode, reaction, infusionAura, bonusStats }) => {
          const targetNode = objPathValue(sheetData.display, path) as
            | NumNode
            | undefined
          if (!targetNode) return constant(0)
          if (hitMode === 'global') hitMode = globalHitMode

          return prod(
            constant(weight),
            infoMut(
              data(targetNode, {
                premod: objMap(bonusStats, (v, k) =>
                  k.endsWith('_') ? percent(v / 100) : constant(v)
                ),
                hit: {
                  hitMode: constant(hitMode),
                  reaction: reaction ? constant(reaction) : none,
                },
                infusion: {
                  team: infusionAura ? constant(infusionAura) : none,
                },
              }),
              { pivot: true }
            )
          )
        }
      )

      // Make the variant "invalid" because its not easy to determine variants in multitarget
      const multiTargetNode = infoMut(sum(...targetNodes), {
        name,
        variant: 'invalid',
      })
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
    },
  }
}
/** These read nodes are very context-specific, and cannot be used anywhere else outside of `uiDataForTeam` */
const teamBuff = setReadNodeKeys(deepNodeClone(input), ['teamBuff']) // Use ONLY by dataObjForTeam
function uiDataForTeam(
  teamData: Dict<CharacterKey, Data[]>,
  gender: GenderKey,
  activeCharKey?: CharacterKey
): Dict<CharacterKey, { target: UIData; buffs: Dict<CharacterKey, UIData> }> {
  // May the goddess of wisdom bless any and all souls courageous
  // enough to attempt for the understanding of this abomination.

  const mergedData = Object.entries(teamData).map(
    ([key, data]) => [key, { ...mergeData(data) }] as [CharacterKey, Data]
  )
  const result = Object.fromEntries(
    mergedData.map(([key]) => [
      key,
      {
        targetRef: {} as Data,
        buffs: [] as Data[],
        calcs: {} as Dict<CharacterKey, Data>,
      },
    ])
  )

  const customReadNodes = {}
  function getReadNode(path: readonly string[]): ReadNode<number> {
    const base =
      path[0] === 'teamBuff'
        ? objPathValue(teamBuff, path.slice(1))
        : objPathValue(input, path)
    if (base) return base
    const custom = objPathValue(customReadNodes, path)
    if (custom) return custom
    const newNode = customRead(path)
    if (path[0] === 'teamBuff' && path[1] === 'tally')
      newNode.accu = objPathValue(tally, path.slice(2))?.accu
    layeredAssignment(customReadNodes, path, newNode)
    return newNode
  }

  Object.values(result).forEach(({ targetRef, buffs, calcs }) =>
    mergedData.forEach(([sourceKey, source]) => {
      const sourceKeyWithGender = sourceKey.includes('Traveler')
        ? `${sourceKey}${gender}`
        : sourceKey
      const sourceBuff = source.teamBuff
      // Create new copy of `calc` as we're mutating it later
      const buff: Data = {},
        calc: Data = deepNodeClone({ teamBuff: sourceBuff })
      buffs.push(buff)
      calcs[sourceKey] = calc

      // This construction creates a `Data` representing buff
      // from `source` applying to `target`. It has 3 data:
      // - `target` contains the reference for the final
      //   data. It is not populated at this stage,
      // - `calc` contains the calculation of the buffs,
      // - `buff` contains read nodes that point to the
      //   calculation in `calc`.

      crawlObject(
        sourceBuff,
        [],
        (x: any) => x.operation,
        (x: NumNode | StrNode, path: string[]) => {
          const info: Info = {
            ...objPathValue(input, path),
            source: sourceKeyWithGender,
            prefix: undefined,
            asConst,
          }
          layeredAssignment(
            buff,
            path,
            resetData(getReadNode(['teamBuff', ...path]), calc, info)
          )

          crawlObject(
            x,
            [],
            (x: any) => x?.operation === 'read',
            (x: ReadNode<number | string>) => {
              if (x.path[0] === 'targetBuff') return // Ignore teamBuff access

              let readNode: ReadNode<number> | ReadNode<string> | undefined,
                data: Data
              if (x.path[0] === 'target') {
                // Link the node to target data
                readNode = getReadNode(x.path.slice(1))
                data = targetRef
              } else {
                // Link the node to source data
                readNode = x
                data = result[sourceKey].targetRef
              }
              layeredAssignment(calc, x.path, resetData(readNode, data))
            }
          )
        }
      )
    })
  )
  mergedData.forEach(([targetKey, data]) => {
    delete data.teamBuff
    const { targetRef, buffs } = result[targetKey]
    const buff = mergeData(buffs)
    crawlObject(
      buff ?? {},
      [],
      (x) => (x as any).operation,
      (x: NumNode, path: string[]) => {
        // CAUTION
        // This is safe only because `buff` is created using only `resetData`
        // and `mergeData`. So every node here is created from either of the
        // two functions, so the mutation wont't affect existing nodes.
        x.info = {
          ...(objPathValue(teamBuff, path) as ReadNode<number> | undefined)
            ?.info,
          prefix: 'teamBuff',
          pivot,
        }
      }
    )
    Object.assign(
      targetRef,
      mergeData([
        data,
        buff,
        { teamBuff: buff, activeCharKey: constant(activeCharKey) },
      ])
    )
    targetRef['target'] = targetRef
  })
  const origin = new UIData(undefined as any, undefined)
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [
      key,
      {
        target: new UIData(value.targetRef, origin),
        buffs: Object.fromEntries(
          Object.entries(value.calcs).map(([key, value]) => [
            key,
            new UIData(value, origin),
          ])
        ),
      },
    ])
  )
}
function mergeData(data: Data[]): Data {
  function internal(data: any[], path: string[]): any {
    if (data.length <= 1) return data[0]
    if (data[0].operation) {
      if (path[0] === 'teamBuff') path = path.slice(1)
      const base = path[0] === 'tally' ? ((path = path.slice(1)), tally) : input
      /*eslint prefer-const: ["error", {"destructuring": "all"}]*/
      let { accu, type } =
        (objPathValue(base, path) as ReadNode<number | string> | undefined) ??
        {}
      if (accu === undefined) {
        const errMsg = `Multiple entries when merging \`unique\` for key ${path}`
        if (process.env.NODE_ENV === 'development') throw new Error(errMsg)
        else console.error(errMsg)

        accu = type === 'number' ? 'max' : 'small'
      }
      const result: NumNode | StrNode = { operation: accu, operands: data }
      return result
    } else {
      return Object.fromEntries(
        [...new Set(data.flatMap((x) => Object.keys(x) as string[]))].map(
          (key) => [
            key,
            internal(
              data.map((x) => x[key]).filter((x) => x),
              [...path, key]
            ),
          ]
        )
      )
    }
  }
  return data.length ? internal(data, []) : {}
}

function computeUIData(data: Data[]): UIData {
  return new UIData(mergeData(data), undefined)
}
type ComparedNodeDisplay<V = number> = NodeDisplay<V> & { diff: V }
function compareTeamBuffUIData(uiData1: UIData, uiData2: UIData): any {
  //Input<ComparedNodeDisplay, ComparedNodeDisplay<string>>
  return compareInternal(uiData1.getTeamBuff(), uiData2.getTeamBuff())
}
function compareDisplayUIData(
  uiData1: UIData,
  uiData2: UIData
): { [key: string]: DisplaySub<ComparedNodeDisplay> } {
  return compareInternal(uiData1.getDisplay(), uiData2.getDisplay())
}
function compareInternal(data1: any | undefined, data2: any | undefined): any {
  if (data1?.operation || data2?.operation) {
    const d1 = data1 as NodeDisplay | undefined
    const d2 = data2 as NodeDisplay | undefined

    if ((d1 && !d1.operation) || (d2 && !d2.operation))
      throw new Error('Unmatched structure when comparing UIData')

    const result: ComparedNodeDisplay = {
      info: {},
      operation: true,
      value: 0,
      isEmpty: true,
      formulas: [],
      ...d1,
      diff: (d2?.value ?? 0) - (d1?.value ?? 0),
    }
    if (typeof d1?.value === 'string' || typeof d2?.value === 'string') {
      // In case `string` got involved, just use the other value
      result.value = d1?.value ?? ('' as any)
      result.diff = d2?.value ?? ('' as any)
    }
    return result
  }

  if (data1 || data2) {
    const keys = new Set([
      ...Object.keys(data1 ?? {}),
      ...Object.keys(data2 ?? {}),
    ])
    return Object.fromEntries(
      [...keys].map((key) => [key, compareInternal(data1?.[key], data2?.[key])])
    )
  }
}

export {
  compareDisplayUIData,
  compareTeamBuffUIData,
  computeUIData,
  dataObjForArtifact,
  dataObjForCharacter,
  dataObjForWeapon,
  inferInfoMut,
  mergeData,
  uiDataForTeam,
}
export type { NodeDisplay, UIData }
