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
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type {
  CustomTarget,
  EnclosingOperation,
  ExpressionOperation,
  ExpressionUnit,
  ICachedArtifact,
  ICachedCharacter,
  ICachedWeapon,
  Team,
  TeamCharacter,
} from '@genshin-optimizer/gi/db'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import { input, tally } from './formula'
import type { Data, Info, NumNode, ReadNode, StrNode } from './type'
import { constant, data, infoMut, none, percent, prod, sum, min, max } from './utils'

export function inferInfoMut(data: Data, source?: Info['source']): Data {
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
export function dataObjForArtifact(
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
export function dataObjForCharacter(char: ICachedCharacter): Data {
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
          percent(
            ((enemyOverride as any)[`${ele.slice(0, -5)}_enemyRes_`] ?? 10) /
              100
          )
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
    sheetData.display['custom'] = {}

    const parseCustomTarget = (
      target: CustomTarget,
      useWeight = true
    ): NumNode => {
      let { weight, path, hitMode, reaction, infusionAura, bonusStats } = target
      const targetNode = objPathValue(sheetData.display, path) as
        | NumNode
        | undefined
      if (!targetNode) return constant(0)
      if (hitMode === 'global') hitMode = globalHitMode

      let result = infoMut(
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
      if (useWeight) result = prod(constant(weight), result)
      return result
    }

    const parseCustomExpression = (e: ExpressionUnit[]): NumNode => {
      const expression = [...e]
      const operationPriority = {
        addition: 1,
        subtraction: 1,
        multiplication: 2,
        division: 2,
        minimum: 3,
        maximum: 3,
        average: 3,
        grouping: 3,
      } as const
      const handled = [] as ExpressionUnit[]
      const stack = [] as EnclosingOperation[]
      let parts = [[]] as ExpressionUnit[][]
      let currentOperation: ExpressionOperation | undefined
      let lastUnit: ExpressionUnit | undefined

      while (expression.length) {
        if (lastUnit) handled.push(lastUnit)
        const unit = expression.shift() as ExpressionUnit
        lastUnit = unit
        if (stack.length) {
          parts[parts.length - 1].push(unit)
          if (unit.type === 'enclosing') {
            if (unit.part === 'head') stack.push(unit.operation)
            if (unit.part === 'tail') stack.pop()
          }
          continue
        }
        if (unit.type === 'enclosing') {
          if (unit.part === 'head') {
            if (!handled.length) {
              // Special case for enclosing as first unit
              currentOperation = unit.operation
              continue
            }
            stack.push(unit.operation)
            parts[parts.length - 1].push(unit)
            continue
          }
          if (unit.part === 'comma') {
            parts.push([])
            continue
          }
          if (unit.part === 'tail') {
            continue
          }
        }
        if (unit.type === 'operation') {
          // Operations with lower priority first, so they will go to a higher node and will be calculated last
          if (
            !currentOperation ||
            operationPriority[unit.operation] <
              operationPriority[currentOperation]
          ) {
            currentOperation = unit.operation
            parts = [[...handled], []]
            continue
          }
          if (unit.operation === currentOperation) {
            parts.push([])
            continue
          }
        }
        if (unit.type === 'null' && unit.kind === 'operation') {
          if (!currentOperation) {
            currentOperation = 'addition'
            parts = [[...handled]]
            continue
          }
          if (currentOperation === 'addition') {
            parts.push([])
            continue
          }
        }
        parts[parts.length - 1].push(unit)
      }

      if (stack.length) throw new Error(`Unclosed enclosing stack ${stack}`)

      if (!currentOperation) {
        // It means we are at the very end of the recursion, we need to process operands
        if (!e.length) return constant(1)
        const operand = e[0]
        if (operand.type === 'constant') return constant(operand.value)
        if (operand.type === 'target')
          return parseCustomTarget(operand.target, false)
        if (operand.type === 'null') return constant(1)
        throw new Error(`Unexpected operand type ${operand.type}`)
      }

      const parsedParts = parts.map(parseCustomExpression)

      if (currentOperation === 'addition') {
        return sum(...parsedParts)
      }
      if (currentOperation === 'subtraction') {
        // TODO: Properly implement subtraction
        return sum(
          parsedParts[0],
          prod(constant(-1), sum(...parsedParts.slice(1)))
        )
      }
      if (currentOperation === 'multiplication') {
        return prod(...parsedParts)
      }
      if (currentOperation === 'division') {
        // TODO: Implement division
        return sum(...parsedParts)
      }
      if (currentOperation === 'minimum') {
        return min(...parsedParts)
      }
      if (currentOperation === 'maximum') {
        return max(...parsedParts)
      }
      if (currentOperation === 'average') {
        // TODO: Properly implement average
        return prod(constant(1 / parsedParts.length), sum(...parsedParts))
      }
      if (currentOperation === 'grouping') {
        // TODO: Properly implement grouping
        return sum(constant(0), ...parsedParts)
      }
      throw new Error(`Unexpected operation ${currentOperation}`)
    }

    customMultiTargets.forEach(({ name, targets, expression }, i) => {
      if (expression) {
        const multiTargetNode = parseCustomExpression(expression)
        sheetData.display!['custom'][i] = infoMut(multiTargetNode, {
          name,
          variant: 'invalid',
        })
      } else {
        const targetNodes = targets.map((target) => parseCustomTarget(target))

        // Make the variant "invalid" because its not easy to determine variants in multitarget
        const multiTargetNode = infoMut(sum(...targetNodes), {
          name,
          variant: 'invalid',
        })
        sheetData.display!['custom'][i] = multiTargetNode
      }
    })
  }
  return result
}
export function dataObjForWeapon(weapon: ICachedWeapon): Data {
  return {
    weapon: {
      id: constant(weapon.id),
      lvl: constant(weapon.level),
      asc: constant(weapon.ascension),
      refinement: constant(weapon.refinement),
    },
  }
}

export function mergeData(data: Data[]): Data {
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
        if (process.env['NODE_ENV'] === 'development') throw new Error(errMsg)
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
