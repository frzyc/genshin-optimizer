import { assertUnreachable, objPathValue } from "../Util/Util"
import { forEachNodes, mapFormulas } from "./internal"
import { constant, sum, prod, cmp } from "./utils"
import { CommutativeMonoidOperation, ComputeNode, ConstantNode, Data, NumNode, Operation, ReadNode, StrNode, StrPrioNode } from "./type"
import { precompute, optimize } from "./optimization"

function zero_deriv(funct: NumNode, binding: (readNode: ReadNode<number>) => string, diff: string): boolean {
  let ret = true
  forEachNodes([funct], _ => { }, f => {
    const { operation } = f
    switch (operation) {
      case "read":
        if (f.type !== "number" || (f.accu && f.accu !== "add"))
          throw new Error(`Unsupported [${operation}] node in zero_deriv`)
        if (binding(f) == diff) ret = false
    }
  })
  return ret
}

function ddx(f: NumNode, binding: (readNode: ReadNode<number>) => string, diff: string): NumNode {
  const { operation } = f
  switch (operation) {
    case "read":
      if (f.type !== "number" || (f.accu && f.accu !== "add"))
        throw new Error(`Unsupported [${operation}] node in d/dx`)
      const name = binding(f)
      if (name == diff) return constant(1)
      return constant(0)
    case "const": return constant(0)
    case "res":
      if (!zero_deriv(f, binding, diff)) throw new Error(`[${operation}] node takes only constant inputs. ${f}`)
      return constant(0)

    case "add": return sum(...f.operands.map(fi => ddx(fi, binding, diff)))
    case "mul":
      let ops = f.operands.map((fi, i) => prod(ddx(fi, binding, diff), ...f.operands.filter((v, ix) => ix !== i)))
      return sum(...ops)
    case "sum_frac":
      const a = f.operands[0]
      const da = ddx(a, binding, diff)
      const b = sum(...f.operands.slice(1,))
      const db = ddx(b, binding, diff)
      const denom = prod(sum(...f.operands), sum(...f.operands))
      const numerator = sum(prod(b, da), prod(-1, a, db))
      return { operation: "sum_frac", operands: [numerator, prod(numerator, -1), denom] }

    case "min": case "max":
      switch (f.operands.length) {
        case 1: return ddx(f.operands[0], binding, diff)
        case 2:
          const [arg1, arg2] = f.operands
          if (operation == "min") return cmp(arg1, arg2, ddx(arg2, binding, diff), ddx(arg1, binding, diff))
          if (operation == "max") return cmp(arg1, arg2, ddx(arg1, binding, diff), ddx(arg2, binding, diff))
          assertUnreachable(operation)
        default:
          throw new Error(`[${operation}] node operates on only 1 or 2 arguments. ${f}`)
      }

      case "threshold":
      const [value, threshold, pass, fail] = f.operands
      if (!zero_deriv(value, binding, diff) || !zero_deriv(threshold, binding, diff))
        throw new Error(`[${operation}] node must branch on constant inputs. ${f}`)
      return cmp(value, threshold, ddx(pass, binding, diff), ddx(fail, binding, diff))

    case "match": case "lookup": case "subscript": case "data":
      throw new Error(`Unsupported [${operation}] node in ddx`)
    default:
      assertUnreachable(operation)
  }
}

class DualNum {
  v: number
  g: number[]
  isConst: boolean

  constructor(v: number, g: number[], isconst: boolean = false) {
    this.v = v;
    this.g = g
    this.isConst = isconst
  }

  static empty = () => new DualNum(0, [], true)
  static constN = (v: number) => new DualNum(v, [], true)

  add(ot: DualNum) {
    if (this.isConst && ot.isConst) return DualNum.constN(this.v + ot.v)

    if (this.isConst) return new DualNum(this.v + ot.v, ot.g)
    if (ot.isConst) return new DualNum(this.v + ot.v, this.g)
    return new DualNum(this.v + ot.v, this.g.map((v, i) => v + ot.g[i]))
  }

  mul(ot: DualNum) {
    if (this.isConst && ot.isConst) return DualNum.constN(this.v * ot.v)

    if (this.isConst) return new DualNum(this.v * ot.v, ot.g.map(gi => ot.v * gi))
    if (ot.isConst) return new DualNum(this.v * ot.v, this.g.map(gi => ot.v * gi))
    return new DualNum(this.v * ot.v, this.g.map((gi, i) => ot.v * gi + this.v * ot.g[i]))
  }

  setg = (n: number, i: number) => {
    this.isConst = false
    this.g = Array(n).fill(0)
    this.g[i] = 1
  }
}


const allOperationsDiff: StrictDict<Operation | "threshold", (_: DualNum[]) => DualNum> = {
  min: (x: DualNum[]): DualNum => x.reduce((ret, cur) => ret.v < cur.v ? ret : cur),
  max: (x: DualNum[]): DualNum => x.reduce((ret, cur) => ret.v > cur.v ? ret : cur),
  add: (x: DualNum[]): DualNum => x.reduce((ret, xi) => ret.add(xi)),
  mul: (x: DualNum[]): DualNum => x.reduce((a, b) => a.mul(b)),
  // sum_frac: (x: DualNum[]): DualNum => x[0] / x.reduce((a, b) => a + b),
  sum_frac: (x: DualNum[]): DualNum => {
    const denom = x.reduce((ret, cur) => ret.add(cur))
    const retv = x[0].v / denom.v

    if (x[0].isConst && denom.isConst)
      return DualNum.constN(retv)

    var retg: number[]
    if (x[0].isConst) retg = denom.g.map(gi => x[0].v * gi / (denom.v * denom.v))
    else if (denom.isConst) retg = x[0].g.map(gi => gi / denom.v)
    else retg = x[0].g.map((g0i, i) => g0i / denom.v - x[0].v * denom.g[i] / (denom.v * denom.v))
    return new DualNum(retv, retg)
  },
  res: ([resDN]: DualNum[]): DualNum => {
    if (resDN.g.some(e => e != 0)) throw new Error(`res node is NOT differentiable`)
    const res = resDN.v
    if (res < 0) return DualNum.constN(1 - res / 2)
    else if (res >= 0.75) return DualNum.constN(1 / (res * 4 + 1))
    return DualNum.constN(1 - res)
  },
  threshold: ([value, threshold, pass, fail]: DualNum[]): DualNum => {
    if (value.g.some(e => e != 0) || threshold.g.some(e => e != 0))
      throw new Error(`Threshold node is NOT differentiable`)
    return value.v >= threshold.v ? pass : fail
  },
}

function precomputeDiff(formulas: NumNode[], binding: (readNode: ReadNode<number>) => string, diff: string[]): (values: Dict<string, number>) => DualNum[] {
  // TODO: Use min-cut to minimize the size of interim array
  type Reference = string | number | { ins: Reference[] }
  // First derivatives implemented
  // const constDN: (x: number) => DualNum = (x: number) => [x, Array(diff.length).fill(0)]

  const uniqueReadStrings = new Set<string>()
  const uniqueNumbers = new Set<number>()
  const mapping = new Map<NumNode, Reference>()

  forEachNodes(formulas, _ => { }, f => {
    const { operation } = f
    switch (operation) {
      case "read":
        if (f.type !== "number" || (f.accu && f.accu !== "add"))
          throw new Error(`Unsupported ${operation} node in precompute`)
        const name = binding(f)
        uniqueReadStrings.add(name)
        mapping.set(f, name)
        break
      case "add": case "min": case "max": case "mul": case "sum_frac":
        mapping.set(f, { ins: f.operands.map(op => mapping.get(op)!) })
        break
      case "threshold": case "res":
        mapping.set(f, { ins: f.operands.map(op => mapping.get(op)!) })
        break
      case "const":
        if (typeof f.value !== "number")
          throw new Error("Found string constant while precomputing")
        const value = f.value
        uniqueNumbers.add(value)
        mapping.set(f as ConstantNode<number>, value)
        break
      case "match": case "lookup": case "subscript":
      case "prio":
      case "data": throw new Error(`Unsupported ${operation} node in precompute`)
      default: assertUnreachable(operation)
    }
  })

  /**
   * [ Outputs , Input , Constants, Deduplicated Compute ]
   *
   * Note that only Compute nodes are deduplicated. Outputs are arranged
   * in the same order as formulas even when they are duplicated. Inputs
   * are arranged in the same order as the read strings, even when they
   * overlap with outputs. If an output is a constant or a compute node,
   * only put the data in the output region.
   */
  const locations = new Map<NumNode | number | string, number>()

  const readStrings = [...uniqueReadStrings], readOffset = formulas.length
  const constValues = [...uniqueNumbers]
  const computations: { out: number, ins: number[], op: (_: DualNum[]) => DualNum, buff: DualNum[] }[] = []
  const compOrder: { out: number, ins: number[], opName: Operation | "threshold" | string }[] = []

  formulas.forEach((f, i) => {
    locations.set(f, i)
    if (f.operation === "const") locations.set(f.value, i)
  })
  // After this line, if some outputs are also read node, `locations`
  // will point to the one in the read node portion instead.
  readStrings.forEach((str, i) => locations.set(str, i + formulas.length))
  let offset = formulas.length + readStrings.length
  constValues.forEach(value => locations.has(value) || locations.set(value, offset++))

  // `locations` is stable from this point on. We now only append new values.
  // There is no change to existing values.
  //
  // DO NOT read from `location` prior to this line.
  mapping.forEach((ref, node) => {
    if (typeof ref !== "object") {
      locations.set(node, locations.get(ref)!)
      return
    }
    if (!locations.has(node)) locations.set(node, offset++)
    compOrder.push({
      out: locations.get(node)!,
      ins: node.operands.map(op => locations.get(op)!),
      opName: node.operation
    })
    computations.push({
      out: locations.get(node)!,
      ins: node.operands.map(op => locations.get(op)!),
      op: allOperationsDiff[node.operation],
      buff: Array(node.operands.length).fill(NaN),
    })
  })

  // const buffer = Array(offset).fill(empty())
  const buffer: DualNum[] = Array(offset)
  for (var i = 0; i < offset; ++i) buffer[i] = DualNum.constN(NaN)

  // Fill constants into buffer; no derivative there.
  uniqueNumbers.forEach(number => buffer[locations.get(number)!].v = number)
  diff.forEach((s, i) => buffer[readOffset + readStrings.indexOf(s)].setg(diff.length, i))

  // Fill out differentiability & do formula validity check on a couple nodes with no diff implemented.
  compOrder.forEach(({ out, ins, opName }) => {
    switch (opName) {
      case "add": case "min": case "max": case "mul": case "sum_frac":
        if (ins.every(i => buffer[i].isConst)) buffer[out].isConst = true
        else buffer[out].isConst = false
        break
      case "res":
        if (!buffer[ins[0]].isConst)
          throw new Error(`res node found a non-const input!`)
        break
      case "threshold":
        if (!buffer[ins[0]].isConst || !buffer[ins[1]].isConst)
          throw new Error(`threshold node found a non-const branch condition!`)
        if (!buffer[ins[2]].isConst || !buffer[3].isConst)
          buffer[out].isConst = false
        break
    }
  })

  // Copy target for when some outputs are duplicated
  const copyList = formulas.map((node, i) => {
    const src = locations.get(node)!
    return src !== i ? [src, i] : undefined!
  }).filter(x => x)
  const copyFormula = copyList.length ? () => {
    copyList.forEach(([src, dst]) => buffer[dst] = buffer[src])
  } : undefined

  return values => {
    readStrings.forEach((id, i) => buffer[readOffset + i].v = values[id] ?? 0)
    computations.forEach(({ out, ins, op, buff }) => {
      ins.forEach((i, j) => buff[j] = buffer[i])
      buffer[out] = op(buff)
    })
    copyFormula?.()
    return buffer
  }
}


export function diff_debug() {
  console.log('Youve reached differentiate!!!')

  const stats: Dict<string, number> = { "0": 0.284294, "1": 0.9462000033378601, "2": 0.1, "3": 1.48, "TenacityOfTheMillelith": 0, "hp_": 0.23249999999999998, "hp": 1159, "ShimenawasReminiscence": 1, "atk_": 0.0933, "atk": 110.58, "EmblemOfSeveredFate": 0, "enerRech_": 0.09709999999999999 }
  // const formula1: NumNode = { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "TenacityOfTheMillelith"], "accu": "add", "info": { "key": "TenacityOfTheMillelith" }, "type": "number" }, { "operation": "const",'type':'number', "operands": [], "value": 2, "type": "number" }, { "operation": "const",'type':'number', "operands": [], "value": 0.2, "info": { "key": "_" }, "type": "number" }, { "operation": "const",'type':'number', "operands": [], "value": 0, "type": "number" }], "info": { "key": "hp_", "source": "TenacityOfTheMillelith" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "hp_"], "info": { "prefix": "art", "asConst": true, "key": "hp_" }, "type": "number", "accu": "add" }, { "operation": "const",'type':'number', "operands": [], "value": 1, "type": "number" }] }, { "operation": "const",'type':'number', "operands": [], "value": 15552.306844604493, "type": "number" }] }, { "operation": "read", "operands": [], "path": ["dyn", "hp"], "info": { "prefix": "art", "asConst": true, "key": "hp" }, "type": "number", "accu": "add" }] }, { "operation": "const",'type':'number', "operands": [], "value": 0.05957, "type": "number" }] }, { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "ShimenawasReminiscence"], "accu": "add", "info": { "key": "ShimenawasReminiscence" }, "type": "number" }, { "operation": "const",'type':'number', "operands": [], "value": 2, "type": "number" }, { "operation": "const",'type':'number', "operands": [], "value": 0.18, "info": { "key": "_" }, "type": "number" }, { "operation": "const",'type':'number', "operands": [], "value": 0, "type": "number" }], "info": { "key": "atk_", "source": "ShimenawasReminiscence" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "atk_"], "info": { "prefix": "art", "asConst": true, "key": "atk_" }, "type": "number", "accu": "add" }, { "operation": "const",'type':'number', "operands": [], "value": 1, "type": "number" }] }, { "operation": "const",'type':'number', "operands": [], "value": 507.727969991803, "type": "number" }] }, { "operation": "read", "operands": [], "path": ["dyn", "atk"], "info": { "prefix": "art", "asConst": true, "key": "atk" }, "type": "number", "accu": "add" }] }, { "operation": "read", "operands": [], "path": ["dyn", "3"], "type": "number", "accu": "add" }, { "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "0"], "type": "number", "accu": "add" }, { "operation": "read", "operands": [], "path": ["dyn", "1"], "type": "number", "accu": "add" }] }, { "operation": "const",'type':'number', "operands": [], "value": 1, "type": "number" }] }, { "operation": "res", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "2"], "type": "number", "accu": "add" }] }, { "operation": "const",'type':'number', "operands": [], "value": 1.1433, "type": "number" }] }
  const formula1: NumNode = { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "TenacityOfTheMillelith"], "accu": "add", "info": { "key": "TenacityOfTheMillelith" }, "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.2, "info": { "key": "_" } }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "info": { "key": "hp_", "source": "TenacityOfTheMillelith" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "hp_"], "info": { "prefix": "art", "asConst": true, "key": "hp_" }, "type": "number", "accu": "add" }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 15552.306844604493 }] }, { "operation": "read", "operands": [], "path": ["dyn", "hp"], "info": { "prefix": "art", "asConst": true, "key": "hp" }, "type": "number", "accu": "add" }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.05957 }] }, { "operation": "mul", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "ShimenawasReminiscence"], "accu": "add", "info": { "key": "ShimenawasReminiscence" }, "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.18, "info": { "key": "_" } }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "info": { "key": "atk_", "source": "ShimenawasReminiscence" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "atk_"], "info": { "prefix": "art", "asConst": true, "key": "atk_" }, "type": "number", "accu": "add" }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 507.727969991803 }] }, { "operation": "read", "operands": [], "path": ["dyn", "atk"], "info": { "prefix": "art", "asConst": true, "key": "atk" }, "type": "number", "accu": "add" }] }, { "operation": "read", "operands": [], "path": ["dyn", "3"], "type": "number", "accu": "add" }, { "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "0"], "type": "number", "accu": "add" }, { "operation": "read", "operands": [], "path": ["dyn", "1"], "type": "number", "accu": "add" }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "res", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "2"], "type": "number", "accu": "add" }] }, { "operation": "add", "operands": [{ "operation": "mul", "operands": [{ "operation": "sum_frac", "operands": [{ "operation": "add", "operands": [{ "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "WanderersTroupe"], "accu": "add", "info": { "key": "WanderersTroupe" }, "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 2 }, { "operation": "const", 'type': 'number', "operands": [], "value": 80 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "info": { "key": "eleMas", "source": "WanderersTroupe" }, "emptyOn": "l" }, { "operation": "read", "operands": [], "path": ["dyn", "eleMas"], "info": { "prefix": "art", "asConst": true, "key": "eleMas" }, "type": "number", "accu": "add" }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 1400 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 2.7777777777777777 }] }, { "operation": "threshold", "operands": [{ "operation": "read", "operands": [], "path": ["dyn", "CrimsonWitchOfFlames"], "accu": "add", "info": { "key": "CrimsonWitchOfFlames" }, "type": "number" }, { "operation": "const", 'type': 'number', "operands": [], "value": 4 }, { "operation": "const", 'type': 'number', "operands": [], "value": 0.15, "info": { "key": "_" } }, { "operation": "const", 'type': 'number', "operands": [], "value": 0 }], "info": { "key": "vaporize_dmg_", "variant": "vaporize", "source": "CrimsonWitchOfFlames" }, "emptyOn": "l" }, { "operation": "const", 'type': 'number', "operands": [], "value": 1 }] }, { "operation": "const", 'type': 'number', "operands": [], "value": 1.71495 }] }
  const formula2: NumNode = { "operation": "threshold", "operands": [formula1, { "operation": "const", 'type': 'number', 'value': 10000, 'operands': [] }, { "operation": "const", 'type': 'number', 'value': 0, 'operands': [] }, { "operation": "const", 'type': 'number', 'value': 1, 'operands': [] }] }
  // const formula2 = formula1

  var compute = precompute([formula2], f => f.path[1])
  var result = compute(stats)[0]
  // console.log(result)

  console.log(zero_deriv(formula2, f => f.path[1], 'hp_'))

  var dhp_ = ddx(formula2, f => f.path[1], 'hp_')
  var c_dhp_ = precompute([dhp_], f => f.path[1])
  console.log('Symbolic diff hp_', c_dhp_(stats)[0])



  // var compDiff = precomputeDiff([formula2], f => f.path[1], ['enerRech_'])
  // var compDiff = precomputeDiff([formula2], f => f.path[1], ['hp_', 'hp', 'atk_', 'eleMas'])
  // var resdiff = compDiff(stats)[0]
  // console.log(result, resdiff)

  // Check validity of calculated derivatives
  // const eps = 1e-5
  // let stat2 = { ...stats }
  // stat2['hp_'] = eps + (stat2['hp_'] ?? 0)
  // var res2 = compute(stat2)[0]
  // console.log('Numeric diff hp_', (res2 - result) / eps)
  // console.log('Dual number diff hp_', resdiff.g[0])
  // var dhp_ = ddx(formula2, f => f.path[1], 'hp_')
  // var c_dhp_ = precompute([dhp_], f => f.path[1])
  // console.log('Symbolic diff hp_', c_dhp_(stats)[0])

  // stat2 = { ...stats }
  // stat2['hp'] = eps + (stat2['hp'] ?? 0)
  // res2 = compute(stat2)[0]
  // console.log('Numeric diff hp', (res2 - result) / eps)
  // console.log('Dual number diff hp', resdiff.g[1])
  // var dhp = ddx(formula2, f => f.path[1], 'hp')
  // var c_dhp = precompute([dhp], f => f.path[1])
  // console.log('Symbolic diff hp', c_dhp(stats)[0])

  // stat2 = { ...stats }
  // stat2['atk_'] = eps + (stat2['atk_'] ?? 0)
  // res2 = compute(stat2)[0]
  // console.log('Numeric diff atk_', (res2 - result) / eps)
  // console.log('Dual number diff atk_', resdiff.g[2])
  // var datk_ = ddx(formula2, f => f.path[1], 'atk_')
  // var c_datk_ = precompute([datk_], f => f.path[1])
  // console.log('Symbolic diff atk_', c_datk_(stats)[0])

  // stat2 = { ...stats }
  // stat2['eleMas'] = eps + (stat2['eleMas'] ?? 0)
  // res2 = compute(stat2)[0]
  // console.log('Numeric diff eleMas', (res2 - result) / eps)
  // console.log('Dual number diff eleMas', resdiff.g[3])
  // var deleMas = ddx(formula2, f => f.path[1], 'eleMas')
  // var c_deleMas = precompute([deleMas], f => f.path[1])
  // console.log('Symbolic diff eleMas', c_deleMas(stats)[0])
}
