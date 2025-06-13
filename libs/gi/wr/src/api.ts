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
  MultiOptHitModeKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type {
  CustomFunction,
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
import { OperationSpecs } from '@genshin-optimizer/gi/db'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import { getMainStatValue } from '@genshin-optimizer/gi/util'
import { input, nonStacking, tally } from './formula'
import type { Data, Info, NumNode, ReadNode, StrNode } from './type'
import {
  constant,
  data,
  frac,
  infoMut,
  max,
  min,
  none,
  percent,
  prod,
  sum,
} from './utils'

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
      else if (path[0] !== 'tally' && path[0] !== 'nonStacking')
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
            (enemyOverride[`${ele.slice(0, -5)}_enemyRes_` as EleEnemyResKey] ??
              10) / 100
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
    (result.customBonus! as any)[key] = key.endsWith('_')
      ? percent(value / 100)
      : constant(value)

  if (enemyOverride.enemyDefRed_)
    result.premod!.enemyDefRed_ = percent(enemyOverride.enemyDefRed_ / 100)
  if (enemyOverride.enemyDefIgn_)
    result.premod!.enemyDefIgn_ = percent(enemyOverride.enemyDefIgn_ / 100)

  crawlObject(
    conditional,
    ['conditional'],
    (x: any) => typeof x === 'string',
    (x: string, keys: string[]) => layeredAssignment(result, keys, constant(x))
  )

  if (sheetData?.display) {
    sheetData.display['custom'] = {}

    customMultiTargets.forEach(
      ({ name, targets, expression, functions }, i) => {
        if (expression) {
          const multiTargetNode = parseCustomExpression(
            expression,
            functions ?? [],
            { sheetData, globalHitMode }
          )
          sheetData.display!['custom'][i] = infoMut(multiTargetNode, {
            name,
            variant: 'invalid',
          })
        } else {
          const targetNodes = targets.map((target) =>
            parseCustomTarget(target, sheetData, globalHitMode)
          )

          // Make the variant "invalid" because its not easy to determine variants in multitarget
          const multiTargetNode = infoMut(sum(...targetNodes), {
            name,
            variant: 'invalid',
          })
          sheetData.display!['custom'][i] = multiTargetNode
        }
      }
    )
  }
  return result
}

function parseCustomTarget(
  target: CustomTarget,
  sheetData: Data,
  globalHitMode: MultiOptHitModeKey,
  useWeight = true
): NumNode {
  let { weight, path, hitMode, reaction, infusionAura, bonusStats } = target
  let targetNode: NumNode | undefined
  const _path = [] as string[]
  for (const step of path) {
    if (step === 'meta') {
      continue
    }
    if (step === 'ops') {
      _path.push('operands')
      continue
    }
    _path.push(step)
  }
  path = _path
  if (path[0] === 'teamBuff') {
    targetNode = objPathValue(sheetData.teamBuff, path[1].split(':'))
  } else {
    targetNode = objPathValue(sheetData.display, path)
  }
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
      const base =
        path[0] === 'tally'
          ? tally
          : path[0] === 'nonStacking'
            ? nonStacking
            : input
      if (path[0] === 'tally' || path[0] === 'nonStacking') path = path.slice(1)
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

function parseCustomExpression(
  e: ExpressionUnit[],
  functions_: CustomFunction[],
  context: {
    sheetData: Data
    globalHitMode: MultiOptHitModeKey
  },
  args: Record<string, NumNode> = {}
): NumNode {
  // functions_ is a list of custom functions that can be used in the expression
  // Functions on the left in the list are assumed to be accessible to functions on the right in the list, but not vice versa.
  // Function assumes that the expression is already validated and is in a valid format
  const expression = [...e]
  const functions: Record<string, CustomFunction> = {}
  functions_.forEach((f) => (functions[f.name] = f))
  const handled = [] as ExpressionUnit[]
  const stack = [] as (EnclosingOperation | CustomFunction['name'])[]
  let parts = [[]] as ExpressionUnit[][]
  let currentOperation: ExpressionOperation | undefined
  let customFunction: CustomFunction | undefined
  let enclosingMode = false

  while (expression.length > 0) {
    const unit = expression.shift()!
    if (stack.length) {
      parts[parts.length - 1].push(unit)
      if (unit.type === 'function' && functions[unit.name]?.args.length) {
        stack.push(unit.name)
      } else if (unit.type === 'enclosing') {
        if (unit.part === 'head') stack.push(unit.operation)
        if (unit.part === 'tail') stack.pop()
      }
    } else if (unit.type === 'function' && functions[unit.name]?.args.length) {
      if (handled.length === 0) {
        // Special case for function with arguments as first unit
        customFunction = functions[unit.name]
        enclosingMode = true
      } else {
        stack.push(unit.name)
        parts[parts.length - 1].push(unit)
      }
    } else if (unit.type === 'enclosing') {
      if (unit.part === 'head') {
        if (handled.length === 0) {
          // Special case for enclosing as first unit
          currentOperation = unit.operation
          enclosingMode = true
        } else {
          stack.push(unit.operation)
          parts[parts.length - 1].push(unit)
        }
      } else if (unit.part === 'comma') {
        // We can only be here if the stack is empty and currentOperation is an enclosing operation or a custom function
        parts.push([])
      } else if (unit.part === 'tail') {
        // We can only be here if current enclosing or custom function is closed
        if (expression.length) {
          enclosingMode = false
          currentOperation = undefined
          customFunction = undefined
          parts[parts.length - 1].push(unit)
        }
      } else {
        throw new Error(
          `Unexpected enclosing part ${((_: never) => _)(unit.part)}`
        )
      }
    } else if (enclosingMode) {
      parts[parts.length - 1].push(unit)
    } else if (
      unit.type === 'operation' ||
      (unit.type === 'null' && unit.kind === 'operation')
    ) {
      let unitOperation: ExpressionOperation
      if (unit.type === 'null') {
        unitOperation = 'multiplication'
      } else {
        unitOperation = unit.operation
      }
      // Operations with lower or equal precedence should be parsed first, so they will go to a higher node and will be calculated last
      if (
        unitOperation !== currentOperation &&
        (!currentOperation ||
          OperationSpecs[unitOperation].precedence <=
            OperationSpecs[currentOperation].precedence)
      ) {
        currentOperation = unitOperation
        parts = [[...handled], []]
      } else if (unitOperation === currentOperation) {
        parts.push([])
      } else {
        parts[parts.length - 1].push(unit)
      }
    } else {
      // Only operands should remain here
      // We process them below
      parts[parts.length - 1].push(unit)
    }
    handled.push(unit)
  }

  if (stack.length) throw new Error(`Unclosed enclosing stack ${stack}`)

  if (customFunction !== undefined) {
    const args_: Record<string, NumNode> = {}
    for (const arg of customFunction.args) {
      const argExpression = parts.shift()
      if (!argExpression) throw new Error(`Missing argument ${arg.name}`)
      args_[arg.name] = parseCustomExpression(
        argExpression,
        functions_,
        context,
        args
      )
    }
    return infoMut(
      parseCustomExpression(
        customFunction.expression,
        functions_.slice(
          0,
          functions_.map((f) => f.name).indexOf(customFunction.name)
        ),
        context,
        args_
      ),
      {
        name: customFunction.name,
        variant: 'invalid',
        pivot: true,
      }
    )
  }

  if (currentOperation === undefined) {
    // It means we are at the very end of the recursion, we need to process operands
    if (!e.length) return constant(1)
    const operand = e[0]
    if (operand.type === 'constant') return constant(operand.value)
    if (operand.type === 'target') {
      return parseCustomTarget(
        operand.target,
        context.sheetData,
        context.globalHitMode,
        false
      )
    }
    if (operand.type === 'function') {
      let result: NumNode | undefined
      if (functions[operand.name]) {
        result = parseCustomExpression(
          functions[operand.name].expression,
          functions_.slice(
            0,
            functions_.map((f) => f.name).indexOf(operand.name)
          ),
          context
        )
        result = infoMut(result, {
          name: operand.name,
          variant: 'invalid',
          pivot: true,
        })
      } else {
        result = args[operand.name]
      }
      if (!result) throw new Error(`Missing argument ${operand.name}`)
      return result
    }
    if (operand.type === 'null') return constant(1)
    throw new Error(`Unexpected operand type ${operand.type} ${operand}`)
  }

  const parsedParts = parts.map((part) =>
    parseCustomExpression(part, functions_, context, args)
  )

  if (currentOperation === 'addition') {
    return sum(...parsedParts)
  }
  if (currentOperation === 'subtraction') {
    // TODO: Properly implement subtraction
    return sum(parsedParts[0], prod(-1, sum(...parsedParts.slice(1))))
  }
  if (currentOperation === 'multiplication') {
    return prod(...parsedParts)
  }
  if (currentOperation === 'division') {
    // TODO: Properly implement division
    if (parsedParts.length < 2)
      throw new Error('Division has less than 2 operands')
    return prod(
      parsedParts[0],
      ...parsedParts.slice(1).map((x) => frac(1, sum(constant(-1), x)))
    )
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
  if (currentOperation === 'priority') {
    if (parsedParts.length > 1)
      throw new Error('Priority should have only 1 operand')
    return sum(constant(0), parsedParts[0])
  }
  if (currentOperation === 'clamp') {
    return min(parsedParts[1], max(parsedParts[0], parsedParts[2]))
  }
  if (currentOperation === 'sum_fraction') {
    return frac(parsedParts[0], parsedParts[1])
  }
  return ((_: never) => {
    throw new Error(`Unexpected operation ${currentOperation}`)
  })(currentOperation)
}
