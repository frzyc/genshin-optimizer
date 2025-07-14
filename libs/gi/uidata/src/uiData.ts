import {
  assertUnreachable,
  crawlObject,
  getUnitStr,
  layeredAssignment,
  objPathValue,
} from '@genshin-optimizer/common/util'
import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import type {
  ComputeNode,
  Data,
  DataNode,
  DisplaySub,
  Info,
  LookupNode,
  MatchNode,
  NumNode,
  ReadNode,
  StrNode,
  SubscriptNode,
  ThresholdNode,
  UIInput,
} from '@genshin-optimizer/gi/wr'
import {
  allOperations,
  constant,
  data,
  input,
  mergeData,
  resetData,
  uiInput,
} from '@genshin-optimizer/gi/wr'
import type { ReactNode } from 'react'

/**
 * @deprecated
 * use CalcResult
 */
interface NodeDisplay<V = number> {
  /** Leave this here to make sure one can use `crawlObject` on hierarchy of `NodeDisplay` */
  operation: true
  info: Info
  value: V
  valueString: string
  /** Whether the node fails the conditional test (`threshold_add`, `match`, etc.) or consists solely of empty nodes */
  isEmpty: boolean
  formula?: ReactNode
  formulas: ReactNode[]
}

export type CalcResult<V = number> = {
  value: V
  meta: {
    op: 'const' | 'add' | 'mul' | 'min' | 'max' | 'sum_frac' | 'res'
    ops: CalcResult<number>[]
    conds: (readonly string[])[]
  }
  info: Info
  isEmpty: boolean
}

export class UIData {
  origin: UIData
  children = new Map<Data, UIData>()

  data: Data[]
  nodes = new Map<NumNode | StrNode, CalcResult<number | string | undefined>>()
  processed = new Map<
    NumNode | StrNode,
    NodeDisplay<number | string | undefined>
  >()

  display: any = undefined
  teamBuff: any = undefined
  bonusStats: any = undefined
  characterStats: any = undefined

  constructor(data: Data, parent: UIData | undefined) {
    if (data === undefined) {
      // Secret *origin* initializer
      this.data = []
      this.origin = this
    } else {
      if (!parent) parent = new UIData(undefined as any, undefined)

      this.data = [data, ...parent.data]
      this.origin = parent.origin
    }
  }

  childUIData(data: Data): UIData {
    let child = this.children.get(data)
    if (!child) {
      child = new UIData(data, this)
      this.children.set(data, child)
    }
    return child
  }

  getDisplay(): {
    [key: string]: DisplaySub<CalcResult>
  } {
    if (!this.display) this.display = this.getAll(['display'])
    return this.display
  }
  getTeamBuff(): UIInput<CalcResult, CalcResult<string>> {
    if (!this.teamBuff) {
      const calculated = this.getAll(['teamBuffDisplay']),
        result = {} as any
      // Convert `input` to `uiInput`
      crawlObject(
        uiInput,
        [],
        (x: any) => x.operation,
        (x: ReadNode<number> | ReadNode<string>, path: string[]) => {
          const node = objPathValue(calculated, x.path) as NumNode | undefined
          if (node) layeredAssignment(result, path, node)
        }
      )
      this.teamBuff = result
    }
    return this.teamBuff
  }
  getBonusStats() {
    if (!this.bonusStats)
      this.bonusStats = Object.fromEntries(
        Object.entries(input.customBonus).map(
          ([key, node]) => [key, this.get(node)] as const
        )
      )
    return this.bonusStats
  }
  getCharacterStats() {
    if (!this.characterStats)
      this.characterStats = {
        lvl: this.get(input.lvl),
        asc: this.get(input.asc),
        constellation: this.get(input.constellation),
        talentAuto: this.get(input.total.auto),
        talentSkill: this.get(input.total.skill),
        talentBurst: this.get(input.total.burst),
      }
    return this.characterStats
  }
  private getAll(prefix: string[]): any {
    const result = {}
    for (const data of this.data) {
      crawlObject(
        objPathValue(data, prefix) ?? {},
        [],
        (x: any) => x.operation,
        (x: NumNode, key: string[]) =>
          layeredAssignment(result, key, this.get(x))
      )
    }
    return result
  }

  get(node: NumNode): CalcResult<number>
  get(node: StrNode): CalcResult<string | undefined>
  get(node: NumNode | StrNode): CalcResult<number | string | undefined>
  get(node: NumNode | StrNode): CalcResult<number | string | undefined> {
    const old = this.nodes.get(node)
    if (old) return old
    const result = this.computeNode(node)
    this.nodes.set(node, result)
    return result
  }

  private computeNode(node: NumNode): CalcResult<number>
  private computeNode(node: StrNode): CalcResult<string | undefined>
  private computeNode(
    node: NumNode | StrNode
  ): CalcResult<number | string | undefined>
  private computeNode(
    node: NumNode | StrNode
  ): CalcResult<number | string | undefined> {
    const old = this.nodes.get(node)
    if (old) return old

    const { operation, info } = node
    let result: CalcResult<number | string | undefined>
    switch (operation) {
      case 'add':
      case 'mul':
      case 'min':
      case 'max':
      case 'res':
      case 'sum_frac':
        result = this._compute(node)
        break
      case 'threshold':
        result = this._threshold(node)
        break
      case 'const':
        result = this._constant(node.value)
        break
      case 'subscript':
        result = this._subscript(node)
        break
      case 'read':
        result = this._read(node)
        break
      case 'data':
        result = this._data(node)
        break
      case 'match':
        result = this._match(node)
        break
      case 'lookup':
        result = this._lookup(node)
        break
      case 'prio':
        result = this._prio(node.operands)
        break
      case 'small':
        result = this._small(node.operands)
        break
      default:
        assertUnreachable(operation)
    }

    if (info) {
      const { path, asConst } = info
      result = { ...result }
      result.info = mergeInfo(result.info, info)

      if (asConst)
        result.meta = {
          op: 'const',
          ops: [],
          conds: [],
        }

      if (path && KeyMap.getStr(path)) {
        if (!result.info.variant) result.info.variant = KeyMap.getVariant(path)
        if (!result.info.unit) result.info.unit = getUnitStr(path)
      }
    }

    this.nodes.set(node, result)
    return result
  }

  private prereadAll(path: readonly string[]): (NumNode | StrNode)[] {
    return this.data
      .map((x) => objPathValue(x, path) as NumNode | StrNode)
      .filter((x) => x)
  }
  private readFirst(
    path: readonly string[]
  ): CalcResult<number | string | undefined> | undefined {
    const data = this.data
      .map((x) => objPathValue(x, path) as NumNode | StrNode)
      .find((x) => x)
    return data && this.computeNode(data)
  }

  private _prio(nodes: readonly StrNode[]): CalcResult<string | undefined> {
    const first = nodes.find(
      (node) => this.computeNode(node).value !== undefined
    )
    return first ? this.computeNode(first) : illformedStr
  }
  private _small(nodes: readonly StrNode[]): CalcResult<string | undefined> {
    let smallest: CalcResult<string | undefined> | undefined = undefined
    for (const node of nodes) {
      const candidate = this.computeNode(node)
      if (
        smallest?.value === undefined ||
        (candidate.value && candidate.value < smallest.value)
      )
        smallest = candidate
    }
    return smallest ?? illformedStr
  }
  private _read(
    node: ReadNode<number | string | undefined>
  ): CalcResult<number | string | undefined> {
    const { path } = node
    let result: CalcResult<number | string | undefined>
    if (node.accu === undefined) {
      result =
        this.readFirst(path) ??
        (node.type === 'string' ? illformedStr : illformed)
    } else {
      const nodes = this.prereadAll(path)
      if (nodes.length === 1) result = this.computeNode(nodes[0])
      result =
        node.accu === 'small'
          ? this._small(nodes as StrNode[])
          : this._accumulate(
              node.accu,
              (nodes as NumNode[]).map((x) => this.computeNode(x))
            )
    }
    const meta = { ...result.meta, path }
    if (path[0] === 'conditional') meta.conds = [path, ...meta.conds]
    return { ...result, meta }
  }
  private _lookup(
    node: LookupNode<NumNode | StrNode>
  ): CalcResult<number | string | undefined> {
    const key = this.computeNode(node.operands[0]).value
    const selected = node.table[key!] ?? node.operands[1]
    if (!selected) throw new Error(`Lookup Fail with key ${key}`)
    return this.computeNode(selected)
  }
  private _match(
    node: MatchNode<StrNode | NumNode, StrNode | NumNode>
  ): CalcResult<number | string | undefined> {
    const [v1Node, v2Node, matchNode, unmatchNode] = node.operands
    const v1 = this.computeNode(v1Node),
      v2 = this.computeNode(v2Node)
    const matching = v1.value === v2.value
    const result = this.computeNode(matching ? matchNode : unmatchNode)
    return (matching && node.emptyOn === 'match') ||
      (!matching && node.emptyOn === 'unmatch')
      ? makeEmpty(result.value)
      : result
  }
  private _threshold(
    node: ThresholdNode<NumNode | StrNode>
  ): CalcResult<number | string | undefined> {
    const [valueNode, thresholdNode, pass, fail] = node.operands
    const value = this.computeNode(valueNode),
      threshold = this.computeNode(thresholdNode)
    const result =
      value.value >= threshold.value
        ? this.computeNode(pass)
        : this.computeNode(fail)
    return value.value >= threshold.value
      ? node.emptyOn === 'ge'
        ? makeEmpty(result.value)
        : result
      : node.emptyOn === 'l'
        ? makeEmpty(result.value)
        : result
  }
  private _data(
    node: DataNode<NumNode | StrNode>
  ): CalcResult<number | string | undefined> {
    const parent = node.reset ? this.origin : this
    return parent.childUIData(node.data).computeNode(node.operands[0])
  }
  private _compute(node: ComputeNode): CalcResult<number> {
    const { operation, operands } = node
    return this._accumulate(
      operation,
      operands.map((x) => this.computeNode(x))
    )
  }
  private _subscript(node: SubscriptNode<number>): CalcResult<number> {
    const operand = this.computeNode(node.operands[0])
    const value = node.list[operand.value] ?? Number.NaN
    return this._constant(value)
  }
  private _constant<V>(value: V): CalcResult<V> {
    return {
      value,
      meta: { op: 'const', ops: [], conds: [] },
      info: {},
      isEmpty: false,
    }
  }
  private _accumulate(
    operation: ComputeNode['operation'],
    operands: CalcResult<number>[]
  ): CalcResult<number> {
    const info = accumulateInfo(operands)
    const isEmpty = operands.every((x) => x.isEmpty)
    switch (operation) {
      case 'add':
      case 'mul':
      case 'min':
      case 'max': {
        if (process.env['NODE_ENV'] !== 'development') {
          const identity = allOperations[operation]([])
          operands = operands.filter((operand) => operand.value !== identity)
        }
      }
    }

    return {
      value: allOperations[operation](operands.map((x) => x.value)),
      meta: {
        op: operation,
        ops: operands,
        conds: operands.flatMap((op) => op.meta.conds),
      },
      info,
      isEmpty,
    }
  }
}
function accumulateInfo<V>(operands: CalcResult<V>[]): Info {
  function score(variant: Required<Info>['variant']) {
    switch (variant) {
      case 'overloaded':
      case 'shattered':
      case 'electrocharged':
      case 'superconduct':
      case 'burning':
      case 'bloom':
      case 'burgeon':
      case 'hyperbloom':
      case 'vaporize':
      case 'melt':
      case 'spread':
      case 'aggravate':
        return 2
      case 'anemo':
      case 'cryo':
      case 'hydro':
      case 'pyro':
      case 'electro':
      case 'geo':
      case 'dendro':
        return 1
      case 'swirl':
      case 'heal':
        return 0.5
      case 'physical':
        return 0
      case 'invalid':
        return -1
      default:
        assertUnreachable(variant as never)
    }
  }
  const variants = new Set(
    operands.flatMap((x) => [x.info.variant!, x.info.subVariant!])
  )
  variants.delete(undefined!)
  const sorted = [...variants].sort((a, b) => score(a) - score(b))
  const result: Info = {}
  if (sorted.length) result.variant = sorted.pop()
  if (sorted.length) result.subVariant = sorted.pop()
  else result.subVariant = result.variant
  return result
}

function mergeInfo(base: Info, override: Info): Info {
  const result = { ...base }
  for (const [key, value] of Object.entries(override))
    if (value) (result[key] as any) = value as any
  return result
}

const illformed: CalcResult<number> = {
  value: Number.NaN,
  meta: {
    op: 'const',
    ops: [],
    conds: [],
  },
  info: {
    pivot: true,
  },
  isEmpty: false,
}
const illformedStr: CalcResult<string | undefined> = {
  value: undefined,
  meta: {
    op: 'const',
    ops: [],
    conds: [],
  },
  info: {
    pivot: true,
  },
  isEmpty: false,
}
function makeEmpty(value: number): CalcResult<number>
function makeEmpty(value: string | undefined): CalcResult<string | undefined>
function makeEmpty(
  value: number | string | undefined
): CalcResult<number | string | undefined>
function makeEmpty(
  value: number | string | undefined
): CalcResult<number | string | undefined> {
  return {
    value,
    meta: {
      op: 'const',
      ops: [],
      conds: [],
    },
    info: {},
    isEmpty: true,
  }
}

export function uiDataForTeam(
  teamData: Partial<Record<CharacterKey, Data[]>>,
  gender: GenderKey,
  activeCharKey: CharacterKey,
  selection: Record<string, CharacterKey> = {}
): Partial<Record<CharacterKey, { target: UIData }>> {
  // May the goddess of wisdom bless any and all souls courageous
  // enough to attempt for the understanding of this abomination.

  const found = (x: any) => x === true
  const isNode = (x: any) => x?.operation
  const asConst = true

  const keys = Object.keys(teamData)
  const sources = keys.map((key): any =>
    key.includes('Traveler') ? key + gender : key
  )
  const own = keys.map((_): Data => ({}))
  const target = keys.map((_) => ({ target: {} }) as Data)
  const buff = keys.map((_) => keys.map((_): Data => ({})))
  // own[i]:[X: input] = <pre-buffed X calc for member i>
  // own[i]:[teamBuff][X: input] = <X buff calc from member i>
  // target[to]:[target][X: input] = <X calc under root/own[to]>
  // buff[to][from]:[X: input] = <teamBuff.X buff calc under root/own[from]/target[to]>
  //
  // totalBuff[i]:[X: input] = mergeData(...buff[i]) = <total buff to member i>
  // mergedData(...own[i], totalBuff[i])[X: input] = <total calc of X for member i>

  crawlObject(input, [], isNode, (r: ReadNode<number>, path) =>
    target.forEach(({ target }: any, to) => {
      const info: Info = { ...r.info, source: sources[to], asConst }
      layeredAssignment(target, path, resetData(r, own[to], info))
    })
  )
  Object.values(teamData).forEach((srcData, from) => {
    const buffed = {} // all entries in `srcData[i].teamBuff.*`
    for (const data of srcData)
      crawlObject(data.teamBuff, [], isNode, (_, path) =>
        layeredAssignment(buffed, path, true)
      )

    crawlObject(buffed, [], found, (_, path) => {
      const r: ReadNode<number> = objPathValue(input, path)
      const info: Info = { ...r.info, source: sources[from], asConst }
      const read = { ...r, path: ['teamBuff', ...path], info }
      keys.forEach((_, to) => {
        const node = resetData(data(read, target[to]), own[from])
        layeredAssignment(buff[to][from], path, node)
      })
    })
  })

  const commonData = { activeCharKey: constant(activeCharKey) }
  for (const [name, charKey] of Object.entries(selection))
    (commonData as any)[name] = (target[keys.indexOf(charKey)] as any).target
  const totalBuff = buff.map((buff) => mergeData(buff))
  totalBuff.forEach((buffData) =>
    crawlObject(buffData, [], isNode, (node: NumNode, path) => {
      const { info }: ReadNode<number> = objPathValue(input, path)
      // This is ok since `node` comes from either `mergeData` or `resetData` (for `buff`) above
      node.info = { ...info, prefix: 'teamBuff', pivot: true }
    })
  )
  Object.values(teamData).forEach((data, i) =>
    Object.assign(own[i], mergeData([...data, totalBuff[i], commonData]), {
      teamBuffDisplay: totalBuff[i],
    })
  )

  const origin = new UIData(undefined as any, undefined)
  return Object.fromEntries(
    keys.map((key, i) => [key, { target: origin.childUIData(own[i]) }])
  )
}

export function computeUIData(data: Data[]): UIData {
  return new UIData(mergeData(data), undefined)
}

type ComparedNodeDisplay<V = number> = NodeDisplay<V> & { diff: V }
export function compareTeamBuffUIData(uiData1: UIData, uiData2: UIData): any {
  //Input<ComparedNodeDisplay, ComparedNodeDisplay<string>>
  return compareInternal(uiData1.getTeamBuff(), uiData2.getTeamBuff())
}
export function compareDisplayUIData(
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
      valueString: '0',
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
