/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 312337:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


;// CONCATENATED MODULE: ./src/app/Util/Util.ts
const getRandomElementFromArray = array => array[Math.floor(Math.random() * array.length)];
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Assumes that the object entries are all primitives + objects
 * shallow copy the object,
 * deep copy the
 * @param obj
 * @returns
 */
function deepClone(obj) {
  if (!obj) return obj;
  if (!Object.keys(obj).length) return {};
  const ret = Object.assign({}, obj);
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v !== "object") return;
    ret[k] = JSON.parse(JSON.stringify(v));
  });
  return ret;
}
const clamp = (val, low, high) => {
  if (val < low) return low;
  if (val > high) return high;
  return val;
};
const getArrLastElement = arr => arr.length ? arr[arr.length - 1] : null;
const clamp01 = val => clamp(val, 0, 1);
const clampPercent = val => clamp(val, 0, 100);

//use to pretty print timestamps, or anything really.
function strPadLeft(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

//fuzzy compare strings. longer the distance, the higher the mismatch.
function hammingDistance(str1, str2) {
  let dist = 0;
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  for (let i = 0, j = Math.max(str1.length, str2.length); i < j; i++) {
    let match = true;
    if (!str1[i] || !str2[i] || str1[i] !== str2[i]) match = false;
    if (str1[i - 1] === str2[i] || str1[i + 1] === str2[i]) match = true;
    if (!match) dist++;
  }
  return dist;
}

//multiplies every numerical value in the obj by a multiplier.
function objMultiplication(obj, multi) {
  if (multi === 1) return obj;
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === "object") objMultiplication(obj[prop], multi);
    if (typeof obj[prop] === "number") obj[prop] = obj[prop] * multi;
  });
  return obj;
}

//assign obj.[keys...] = value
function layeredAssignment(obj, keys, value) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return accu[key] = value;
    if (!accu[key]) accu[key] = {};
    return accu[key];
  }, obj);
  return obj;
}
//get the value in a nested object, giving array of path
function objPathValue(obj, keys) {
  if (!obj || !keys) return undefined;
  !Array.isArray(keys) && console.error(keys);
  return keys.reduce((a, k) => a == null ? void 0 : a[k], obj);
}
//delete the value denoted by the path. Will also delete empty objects as well.
function deletePropPath(obj, path) {
  const tempPath = [...path];
  const lastKey = tempPath.pop();
  const objPathed = objPathValue(obj, tempPath);
  objPathed == null ? true : delete objPathed[lastKey];
}
function objClearEmpties(o) {
  for (const k in o) {
    if (typeof o[k] !== "object") continue;
    objClearEmpties(o[k]);
    if (!Object.keys(o[k]).length) delete o[k];
  }
}
function crawlObject(obj, keys = [], validate, cb) {
  if (validate(obj, keys)) cb(obj, keys);else obj && typeof obj === "object" && Object.entries(obj).forEach(([key, val]) => crawlObject(val, [...keys, key], validate, cb));
}
// const getObjectKeysRecursive = (obj) => Object.values(obj).reduce((a, prop) => typeof prop === "object" ? [...a, ...getObjectKeysRecursive(prop)] : a, Object.keys(obj))
const getObjectKeysRecursive = obj => typeof obj === "object" ? Object.values(obj).flatMap(getObjectKeysRecursive).concat(Object.keys(obj)) : typeof obj === "string" ? [obj] : [];
function evalIfFunc(value, arg) {
  return typeof value === "function" ? value(arg) : value;
}
//fromEntries doesn't result in StrictDict, this is just a utility wrapper.
function Util_objectKeyMap(keys, map) {
  return Object.fromEntries(keys.map((k, i) => [k, map(k, i)]));
}
//fromEntries doesn't result in StrictDict, this is just a utility wrapper.
function objectKeyValueMap(items, map) {
  return Object.fromEntries(items.map((t, i) => map(t, i)));
}
function objectMap(obj, fn) {
  return Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
}
const rangeGen = function* rangeGen(from, to) {
  for (let i = from; i <= to; i++) yield i;
};

/** range of [from, to], inclusive */
function range(from, to) {
  return [...rangeGen(from, to)];
}
function assertUnreachable(value) {
  throw new Error(`Should not reach this with value ${value}`);
}

/** Will change `arr` in-place */
function toggleInArr(arr, value) {
  const ind = arr.indexOf(value);
  if (ind < 0) arr.push(value);else arr.splice(ind, 1);
}
function toggleArr(arr, value) {
  return arr.includes(value) ? arr.filter(a => a !== value) : [...arr, value];
}
function deepFreeze(obj, layers = 5) {
  if (layers === 0) return obj;
  if (typeof obj === "object") Object.values(Object.freeze(obj)).forEach(o => deepFreeze(o, layers--));
  return obj;
}
function arrayMove(arr, oldIndex, newIndex) {
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  if (oldIndex < 0 || oldIndex >= arr.length) return arr;
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  return arr;
}
;// CONCATENATED MODULE: ./src/app/Formula/utils.ts

const todo = constant(NaN, {
  name: "TODO"
});
const one = percent(1),
  naught = percent(0);
const none = constant("none");
function constant(value, info) {
  return typeof value === "number" ? {
    operation: "const",
    operands: [],
    type: "number",
    value,
    info
  } : {
    operation: "const",
    operands: [],
    type: "string",
    value,
    info
  };
}
/** `value` in percentage. The value is written as non-percentage, e.g., `percent(1)` for 100% */
function percent(value, info) {
  if (value >= Number.MAX_VALUE / 100) value = Infinity;
  if (value <= -Number.MAX_VALUE / 100) value = -Infinity;
  return constant(value, Object.assign({
    unit: "%"
  }, info));
}
/** Inject `info` to the node in-place */

function infoMut(node, info) {
  if (info) node.info = Object.assign({}, node.info, info);
  return node;
}

/** `table[string] ?? defaultNode` */

function lookup(index, table, defaultV, info) {
  return {
    operation: "lookup",
    operands: defaultV !== "none" ? [intoV(index), intoV(defaultV)] : [intoV(index)],
    table,
    info
  };
}

/** min( x1, x2, ... ) */

function min(...values) {
  return {
    operation: "min",
    operands: intoOps(values)
  };
}
/** max( x1, x2, ... ) */

function max(...values) {
  return {
    operation: "max",
    operands: intoOps(values)
  };
}
/** x1 + x2 + ... */

function sum(...values) {
  return {
    operation: "add",
    operands: intoOps(values)
  };
}
/** x1 * x2 * ... */

function prod(...values) {
  return {
    operation: "mul",
    operands: intoOps(values)
  };
}
/** x / (x + c) */

function frac(x, c) {
  return {
    operation: "sum_frac",
    operands: intoOps([x, c])
  };
}
function res(base) {
  return {
    operation: "res",
    operands: intoOps([base])
  };
}

/** v1 == v2 ? eq : neq */

function compareEq(v1, v2, eq, neq, info) {
  return {
    operation: "match",
    operands: [intoV(v1), intoV(v2), intoV(eq), intoV(neq)],
    info
  };
}
/** v1 == v2 ? pass : 0 */

function equal(v1, v2, pass, info) {
  return {
    operation: "match",
    operands: [intoV(v1), intoV(v2), intoVInfo(pass, info), intoV(0)],
    emptyOn: "unmatch"
  };
}
/** v1 == v2 ? pass : `undefined` */

function equalStr(v1, v2, pass, info) {
  return {
    operation: "match",
    operands: [intoV(v1), intoV(v2), intoVInfo(pass, info), intoV(undefined)],
    emptyOn: "unmatch"
  };
}
/** v1 != v2 ? pass : 0 */

function unequal(v1, v2, pass, info) {
  return {
    operation: "match",
    operands: [intoV(v1), intoV(v2), intoV(0), intoVInfo(pass, info)],
    emptyOn: "match"
  };
}
/** v1 != v2 ? pass : `undefined` */

function unequalStr(v1, v2, pass, info) {
  return {
    operation: "match",
    operands: [intoV(v1), intoV(v2), intoV(undefined), intoVInfo(pass, info)],
    emptyOn: "match"
  };
}
/** v1 >= v2 ? pass : 0 */

function greaterEq(v1, v2, pass, info) {
  return {
    operation: "threshold",
    operands: [intoV(v1), intoV(v2), intoVInfo(pass, info), intoV(0)],
    emptyOn: "l"
  };
}
/** v1 >= v2 ? pass : `undefined` */
function greaterEqStr(v1, v2, pass, info) {
  return {
    operation: "threshold",
    operands: [intoV(v1), intoV(v2), intoVInfo(pass, info), intoV(undefined)],
    emptyOn: "l"
  };
}
/** v1 < v2 ? pass : 0 */

function lessThan(v1, v2, pass, info) {
  return {
    operation: "threshold",
    operands: [intoV(v1), intoV(v2), intoV(0), intoVInfo(pass, info)],
    emptyOn: "ge"
  };
}
/** v1 >= v2 ? ge : le */

function utils_threshold(v1, v2, ge, le, info) {
  return {
    operation: "threshold",
    operands: [intoV(v1), intoV(v2), intoV(ge), intoV(le)],
    info
  };
}
function setReadNodeKeys(nodeList, prefix = []) {
  if (nodeList.operation) {
    if (nodeList.operation !== "read") throw new Error(`Found ${nodeList.operation} node while making reader`);
    return Object.assign({}, nodeList, {
      path: prefix
    });
  } else {
    return objectKeyMap(Object.keys(nodeList), key => setReadNodeKeys(nodeList[key], [...prefix, key]));
  }
}
function data(base, data) {
  return {
    operation: "data",
    operands: [base],
    data
  };
}
function resetData(base, data, info) {
  return {
    operation: "data",
    operands: [base],
    data,
    reset: true,
    info
  };
}
function customRead(path, info) {
  return {
    operation: "read",
    operands: [],
    path,
    info,
    type: "number"
  };
}
function customStringRead(path) {
  return {
    operation: "read",
    operands: [],
    path,
    type: "string"
  };
}
function read(accu, info) {
  return {
    operation: "read",
    operands: [],
    path: [],
    accu,
    info,
    type: "number"
  };
}
/**
 * CAUTION: Use `prio` accumulation sparingly. WR don't assume the reading order, so the result may be unstable
 */
function stringRead(accu) {
  return {
    operation: "read",
    operands: [],
    path: [],
    accu,
    type: "string"
  };
}
function stringPrio(...operands) {
  return {
    operation: "prio",
    operands: intoOps(operands)
  };
}
/** list[index] */
function subscript(index, list, info) {
  return {
    operation: "subscript",
    operands: [index],
    list,
    info
  };
}
function intoOps(values) {
  return values.map(value => typeof value === "object" ? value : constant(value));
}
function intoV(value) {
  return typeof value !== "object" ? constant(value) : value;
}
function intoVInfo(value, info) {
  if (!info) return intoV(value);
  return typeof value !== "object" ? constant(value, info) : infoMut(Object.assign({}, value), info);
}
;// CONCATENATED MODULE: ./src/app/Formula/internal.ts

function deepNodeClone(data) {
  const map = new Map();
  function internal(orig) {
    if (typeof orig !== "object") return orig;
    const old = map.get(orig);
    if (old) return old;
    const cache = Array.isArray(orig) ? orig.map(val => internal(val)) : Object.fromEntries(Object.entries(orig).map(([key, val]) => [key, key === "info" ? val : internal(val)]));
    map.set(orig, cache);
    return cache;
  }
  return internal(data);
}
function forEachNodes(formulas, topDown, bottomUp) {
  const visiting = new Set(),
    visited = new Set();
  function traverse(formula) {
    if (visited.has(formula)) return;
    if (visiting.has(formula)) {
      console.error("Found cyclical dependency during formula traversal");
      return;
    }
    visiting.add(formula);
    topDown(formula);
    formula.operands.forEach(traverse);
    bottomUp(formula);
    visiting.delete(formula);
    visited.add(formula);
  }
  formulas.forEach(traverse);
}
function internal_mapFormulas(formulas, topDownMap, bottomUpMap) {
  const visiting = new Set();
  const topDownMapped = new Map();
  const bottomUpMapped = new Map();
  function check(formula) {
    let topDown = topDownMapped.get(formula);
    if (topDown) return topDown;
    topDown = topDownMap(formula);
    let bottomUp = bottomUpMapped.get(topDown);
    if (bottomUp) return bottomUp;
    if (visiting.has(topDown)) {
      console.error("Found cyclical dependency during formula mapping");
      return constant(NaN);
    }
    visiting.add(topDown);
    bottomUp = bottomUpMap(traverse(topDown), formula);
    visiting.delete(topDown);
    topDownMapped.set(formula, bottomUp);
    bottomUpMapped.set(topDown, bottomUp);
    return bottomUp;
  }
  function traverse(formula) {
    const operands = formula.operands.map(check);
    return arrayEqual(operands, formula.operands) ? formula : Object.assign({}, formula, {
      operands
    });
  }
  const result = formulas.map(check);
  return arrayEqual(result, formulas) ? formulas : result;
}
function customMapFormula(formulas, context, map) {
  const contextMapping = new Map();
  function internalMap(formula, context) {
    let current = contextMapping.get(context);
    if (!current) contextMapping.set(context, current = [new Set(), new Map()]);
    const [visiting, mapping] = current;
    const old = mapping.get(formula);
    if (old) return old;
    if (visiting.has(formula)) throw new Error("Found cyclical dependency during formula mapping");
    visiting.add(formula);
    const newFormula = map(formula, context, internalMap);
    mapping.set(formula, newFormula);
    visiting.delete(formula);
    return newFormula;
  }
  return formulas.map(formula => internalMap(formula, context));
}
function arrayEqual(a, b) {
  if (a === undefined) return b === undefined;
  if (b === undefined) return false;
  return a.length === b.length && a.every((value, i) => value === b[i]);
}
;// CONCATENATED MODULE: ./src/app/Formula/optimization.ts



const allCommutativeMonoidOperations = {
  min: x => Math.min(...x),
  max: x => Math.max(...x),
  add: x => x.reduce((a, b) => a + b, 0),
  mul: x => x.reduce((a, b) => a * b, 1)
};
const allOperations = Object.assign({}, allCommutativeMonoidOperations, {
  res: ([res]) => {
    if (res < 0) return 1 - res / 2;else if (res >= 0.75) return 1 / (res * 4 + 1);
    return 1 - res;
  },
  sum_frac: x => x[0] / x.reduce((a, b) => a + b),
  threshold: ([value, threshold, pass, fail]) => value >= threshold ? pass : fail
});
const commutativeMonoidOperationSet = new Set(Object.keys(allCommutativeMonoidOperations));
function optimize(formulas, topLevelData, shouldFold = _formula => false) {
  let opts = constantFold(formulas, topLevelData, shouldFold);
  opts = flatten(opts);
  return deduplicate(opts);
}
function precompute(formulas, initial, binding, slotCount) {
  let body = `
"use strict";
// copied from the code above
function res(res) {
  if (res < 0) return 1 - res / 2
  else if (res >= 0.75) return 1 / (res * 4 + 1)
  return 1 - res
}
const x0=0`; // making sure `const` has at least one entry

  let i = 1;
  const names = new Map();
  forEachNodes(formulas, _ => {}, f => {
    const {
        operation,
        operands
      } = f,
      name = `x${i++}`,
      operandNames = operands.map(x => names.get(x));
    names.set(f, name);
    switch (operation) {
      case "read":
        {
          const key = binding(f);
          let arr = new Array(slotCount).fill(null).map((x, i) => `(b[${i}].values["${key}"] ?? 0)`);
          if (initial[key] && initial[key] !== 0) {
            arr = [initial[key].toString(), ...arr];
          }
          body += `,${name}=${arr.join('+')}`;
          break;
        }
      case "const":
        names.set(f, `(${f.value})`);
        break;
      case "add":
      case "mul":
        body += `,${name}=${operandNames.join(operation === "add" ? "+" : "*")}`;
        break;
      case "min":
      case "max":
        body += `,${name}=Math.${operation}(${operandNames})`;
        break;
      case "threshold":
        {
          const [value, threshold, pass, fail] = operandNames;
          body += `,${name}=(${value}>=${threshold})?${pass}:${fail}`;
          break;
        }
      case "res":
        body += `,${name}=res(${operandNames[0]})`;
        break;
      case "sum_frac":
        body += `,${name}=${operandNames[0]}/(${operandNames[0]}+${operandNames[1]})`;
        break;
      default:
        assertUnreachable(operation);
    }
  });
  body += `;\nreturn [${formulas.map(f => names.get(f))}]`;
  return new Function(`b`, body);
}
function flatten(formulas) {
  return internal_mapFormulas(formulas, f => f, _formula => {
    let result = _formula;
    if (commutativeMonoidOperationSet.has(_formula.operation)) {
      const formula = _formula;
      const {
        operation
      } = formula;
      let flattened = false;
      const operands = formula.operands.flatMap(dep => dep.operation === operation ? (flattened = true, dep.operands) : [dep]);
      result = flattened ? Object.assign({}, formula, {
        operands
      }) : formula;
    }
    return result;
  });
}
function deduplicate(formulas) {
  function elementCounts(array) {
    const result = new Map();
    for (const value of array) {
      var _result$get;
      result.set(value, ((_result$get = result.get(value)) != null ? _result$get : 0) + 1);
    }
    return result;
  }
  function arrayFromCounts(counts) {
    return [...counts].flatMap(([dep, count]) => Array(count).fill(dep));
  }
  const wrap = {
    common: {
      counts: new Map(),
      formulas: new Set(),
      operation: "add"
    }
  };
  while (true) {
    let next;
    const factored = {
      operation: wrap.common.operation,
      operands: arrayFromCounts(wrap.common.counts)
    };
    const candidatesByOperation = new Map();
    for (const operation of Object.keys(allCommutativeMonoidOperations)) candidatesByOperation.set(operation, []);
    formulas = internal_mapFormulas(formulas, _formula => {
      if (wrap.common.formulas.has(_formula)) {
        const formula = _formula;
        const remainingCounts = new Map(wrap.common.counts);
        const operands = formula.operands.filter(dep => {
          const count = remainingCounts.get(dep);
          if (count) {
            remainingCounts.set(dep, count - 1);
            return false;
          }
          return true;
        });
        if (!operands.length) return factored;
        operands.push(factored);
        return Object.assign({}, formula, {
          operands
        });
      }
      return _formula;
    }, _formula => {
      if (!commutativeMonoidOperationSet.has(_formula.operation)) return _formula;
      const formula = _formula;
      if (next) {
        if (next.operation === formula.operation) {
          const currentCounts = elementCounts(formula.operands),
            commonCounts = new Map();
          const nextCounts = next.counts;
          let total = 0;
          for (const [dependency, currentCount] of currentCounts.entries()) {
            var _nextCounts$get;
            const commonCount = Math.min(currentCount, (_nextCounts$get = nextCounts.get(dependency)) != null ? _nextCounts$get : 0);
            if (commonCount) {
              commonCounts.set(dependency, commonCount);
              total += commonCount;
            } else commonCounts.delete(dependency);
          }
          if (total > 1) {
            next.counts = commonCounts;
            next.formulas.add(formula);
          }
        }
      } else {
        const candidates = candidatesByOperation.get(formula.operation);
        const counts = elementCounts(formula.operands);
        for (const [candidate, candidateCounts] of candidates) {
          let total = 0;
          const commonCounts = new Map();
          for (const [dependency, candidateCount] of candidateCounts.entries()) {
            var _counts$get;
            const count = Math.min(candidateCount, (_counts$get = counts.get(dependency)) != null ? _counts$get : 0);
            if (count) {
              commonCounts.set(dependency, count);
              total += count;
            }
          }
          if (total > 1) {
            next = {
              counts: commonCounts,
              formulas: new Set([formula, candidate]),
              operation: formula.operation
            };
            candidatesByOperation.clear();
            break;
          }
        }
        if (!next) candidates.push([formula, counts]);
      }
      return formula;
    });
    if (next) wrap.common = next;else break;
  }
  return formulas;
}

/**
 * Replace nodes with known values with appropriate constants,
 * avoiding removal of any nodes that pass `isFixed` predicate
 */
function constantFold(formulas, topLevelData, shouldFold = _formula => false) {
  const origin = {
    data: [],
    processed: new Map()
  };
  const nextContextMap = new Map([[origin, new Map()]]);
  const context = {
    data: [topLevelData],
    processed: new Map()
  };
  nextContextMap.set(context, new Map());
  nextContextMap.get(origin).set(topLevelData, context);
  return customMapFormula(formulas, context, (formula, context, map) => {
    var _formulaOperands$;
    const {
        operation
      } = formula,
      fold = (x, c) => map(x, c);
    const foldStr = (x, c) => map(x, c);
    let result;
    switch (operation) {
      case "const":
        result = formula;
        break;
      case "add":
      case "mul":
      case "max":
      case "min":
        const f = allOperations[operation];
        const numericOperands = [];
        const formulaOperands = formula.operands.filter(formula => {
          const folded = fold(formula, context);
          return folded.operation === "const" ? (numericOperands.push(folded.value), false) : true;
        }).map(x => fold(x, context));
        const numericValue = f(numericOperands);

        // Fold degenerate cases. This may incorrectly compute NaN
        // results, which shouldn't appear under expected usage.
        // - zero
        //   - 0 * ... = 0
        // - infinity
        //   - max(infinity, ...) = infinity
        //   - infinity + ... = infinity
        // - (-infinity)
        //   - min(-infinity, ...) - infinity
        //   - (-infinity) + ... = -infinity
        // - NaN
        //   - operation(NaN, ...) = NaN
        if (!isFinite(numericValue)) {
          if (operation !== "mul" && (operation !== "max" || numericValue > 0) && (operation !== "min" || numericValue < 0)) {
            result = constant(numericValue);
            break;
          }
        } else if (operation === "mul" && numericValue === 0) {
          result = constant(numericValue);
          break;
        }
        if (numericValue !== f([]))
          // Skip vacuous values
          formulaOperands.push(constant(numericValue));
        if (formulaOperands.length <= 1) result = (_formulaOperands$ = formulaOperands[0]) != null ? _formulaOperands$ : constant(f([]));else result = {
          operation,
          operands: formulaOperands
        };
        break;
      case "res":
      case "sum_frac":
        {
          const operands = formula.operands.map(x => fold(x, context));
          const _f = allOperations[operation];
          if (operands.every(x => x.operation === "const")) result = constant(_f(operands.map(x => x.value)));else result = Object.assign({}, formula, {
            operands
          });
          break;
        }
      case "lookup":
        {
          const index = foldStr(formula.operands[0], context);
          if (index.operation === "const") {
            var _formula$table;
            const selected = (_formula$table = formula.table[index.value]) != null ? _formula$table : formula.operands[1];
            if (selected) {
              result = map(selected, context);
              break;
            }
          }
          throw new Error(`Unsupported ${operation} node while folding`);
        }
      case "prio":
        {
          const first = formula.operands.find(op => {
            const folded = foldStr(op, context);
            if (folded.operation !== "const") throw new Error(`Unsupported ${operation} node while folding`);
            return folded.value !== undefined;
          });
          result = first ? foldStr(first, context) : constant(undefined);
          break;
        }
      case "small":
        {
          var _smallest2;
          let smallest = undefined;
          for (const operand of formula.operands) {
            var _smallest;
            const folded = foldStr(operand, context);
            if (folded.operation !== "const") throw new Error(`Unsupported ${operation} node while folding`);
            if (((_smallest = smallest) == null ? void 0 : _smallest.value) === undefined || folded.value !== undefined && folded.value < smallest.value) smallest = folded;
          }
          result = (_smallest2 = smallest) != null ? _smallest2 : constant(undefined);
          break;
        }
      case "match":
        {
          const [v1, v2, match, unmatch] = formula.operands.map(x => map(x, context));
          if (v1.operation !== "const" || v2.operation !== "const") throw new Error(`Unsupported ${operation} node while folding`);
          result = v1.value === v2.value ? match : unmatch;
          break;
        }
      case "threshold":
        {
          const [value, threshold, pass, fail] = formula.operands.map(x => map(x, context));
          if (pass.operation === "const" && fail.operation === "const" && pass.value === fail.value) result = pass;else if (value.operation === "const" && threshold.operation === "const") result = value.value >= threshold.value ? pass : fail;else result = Object.assign({}, formula, {
            operands: [value, threshold, pass, fail]
          });
          break;
        }
      case "subscript":
        {
          const index = fold(formula.operands[0], context);
          if (index.operation !== "const") throw new Error("Found non-constant subscript node while folding");
          result = constant(formula.list[index.value]);
          break;
        }
      case "read":
        {
          const operands = context.data.map(x => objPathValue(x, formula.path)).filter(x => x);
          if (operands.length === 0) {
            if (shouldFold(formula)) {
              const {
                accu
              } = formula;
              if (accu === undefined || accu === "small") result = formula.type === "string" ? constant(undefined) : constant(NaN);else result = constant(allOperations[accu]([]));
            } else result = formula;
          } else if (formula.accu === undefined || operands.length === 1) result = map(operands[operands.length - 1], context);else result = map({
            operation: formula.accu,
            operands
          }, context);
          break;
        }
      case "data":
        {
          if (formula.reset) context = origin;
          const nextMap = nextContextMap.get(context);
          let nextContext = nextMap.get(formula.data);
          if (!nextContext) {
            nextContext = {
              data: [...context.data, formula.data],
              processed: new Map()
            };
            nextContextMap.set(nextContext, new Map());
            nextMap.set(formula.data, nextContext);
          }
          result = map(formula.operands[0], nextContext);
          break;
        }
      default:
        assertUnreachable(operation);
    }
    if (result.info) {
      result = Object.assign({}, result);
      delete result.info;
    }
    return result;
  });
}
const testing = {
  constantFold,
  flatten,
  deduplicate
};
// EXTERNAL MODULE: ../../node_modules/core-js/modules/es.array.iterator.js
var es_array_iterator = __webpack_require__(315735);
// EXTERNAL MODULE: ../../node_modules/core-js/modules/web.dom-collections.iterator.js
var web_dom_collections_iterator = __webpack_require__(906886);
// EXTERNAL MODULE: ../../node_modules/core-js/modules/es.array.includes.js
var es_array_includes = __webpack_require__(739529);
;// CONCATENATED MODULE: ../../libs/consts/src/character.ts



const genderKeys = (/* unused pure expression or super */ null && (["F", "M"]));
const allElements = ['anemo', 'geo', 'electro', 'hydro', 'pyro', 'cryo', 'dendro'];
const allElementsWithPhy = ["physical", ...allElements];
const allRegions = (/* unused pure expression or super */ null && (["mondstadt", "liyue", "inazuma", "sumeru", "fontaine", "natlan", "snezhnaya", "khaenriah"]));
const nonTravelerCharacterKeys = ["Albedo", "Alhaitham", "Aloy", "Amber", "AratakiItto", "Barbara", "Beidou", "Bennett", "Candace", "Chongyun", "Collei", "Cyno", "Diluc", "Diona", "Dori", "Eula", "Faruzan", "Fischl", "Ganyu", "Gorou", "HuTao", "Jean", "KaedeharaKazuha", "Kaeya", "KamisatoAyaka", "KamisatoAyato", "Keqing", "Klee", "KujouSara", "KukiShinobu", "Layla", "Lisa", "Mona", "Nahida", "Nilou", "Ningguang", "Noelle", "Qiqi", "RaidenShogun", "Razor", "Rosaria", "SangonomiyaKokomi", "Sayu", "Shenhe", "ShikanoinHeizou", "Sucrose", "Tartaglia", "Thoma", "Tighnari", "Venti", "Wanderer", "Xiangling", "Xiao", "Xingqiu", "Xinyan", "YaeMiko", "Yanfei", "Yaoyao", "Yelan", "Yoimiya", "YunJin", "Zhongli"];
const travelerKeys = ["TravelerAnemo", "TravelerGeo", "TravelerElectro", "TravelerDendro"];
const locationGenderedCharacterKeys = [...nonTravelerCharacterKeys, "TravelerF", "TravelerM"];
const allCharacterKeys = [...nonTravelerCharacterKeys, ...travelerKeys];
function characterKeyToLocationGenderedCharacterKey(charKey, gender) {
  if (travelerKeys.includes(charKey)) return `Traveler${gender}`;
  return charKey;
}
;// CONCATENATED MODULE: ../../libs/consts/src/artifact.ts
const allArtifactSets = (/* unused pure expression or super */ null && (["Adventurer", "ArchaicPetra", "Berserker", "BlizzardStrayer", "BloodstainedChivalry", "BraveHeart", "CrimsonWitchOfFlames", "DeepwoodMemories", "DefendersWill", "DesertPavilionChronicle", "EchoesOfAnOffering", "EmblemOfSeveredFate", "FlowerOfParadiseLost", "Gambler", "GildedDreams", "GladiatorsFinale", "HeartOfDepth", "HuskOfOpulentDreams", "Instructor", "Lavawalker", "LuckyDog", "MaidenBeloved", "MartialArtist", "NoblesseOblige", "OceanHuedClam", "PaleFlame", "PrayersForDestiny", "PrayersForIllumination", "PrayersForWisdom", "PrayersToSpringtime", "ResolutionOfSojourner", "RetracingBolide", "Scholar", "ShimenawasReminiscence", "TenacityOfTheMillelith", "TheExile", "ThunderingFury", "Thundersoother", "TinyMiracle", "TravelingDoctor", "VermillionHereafter", "ViridescentVenerer", "WanderersTroupe"]));
const allSlotKeys = (/* unused pure expression or super */ null && (["flower", "plume", "sands", "goblet", "circlet"]));
const artMaxLevel = {
  1: 4,
  2: 4,
  3: 12,
  4: 16,
  5: 20
};
;// CONCATENATED MODULE: ../../libs/consts/src/weapon.ts


const allWeaponTypeKeys = (/* unused pure expression or super */ null && (['sword', 'claymore', 'polearm', 'bow', 'catalyst']));
const allWeaponSwordKeys = ["AmenomaKageuchi", "AquilaFavonia", "BlackcliffLongsword", "CinnabarSpindle", "CoolSteel", "KagotsurubeIsshin", "DarkIronSword", "DullBlade", "FavoniusSword", "FesteringDesire", "FilletBlade", "FreedomSworn", "HaranGeppakuFutsu", "HarbingerOfDawn", "IronSting", "KeyOfKhajNisut", "LightOfFoliarIncision", "LionsRoar", "MistsplitterReforged", "PrimordialJadeCutter", "PrototypeRancour", "RoyalLongsword", "SacrificialSword", "SapwoodBlade", "SilverSword", "SkyriderSword", "SkywardBlade", "SummitShaper", "SwordOfDescension", "TheAlleyFlash", "TheBlackSword", "TheFlute", "ToukabouShigure", "TravelersHandySword", "XiphosMoonlight"];
const allWeaponClaymoreKeys = ["Akuoumaru", "BlackcliffSlasher", "BloodtaintedGreatsword", "DebateClub", "FavoniusGreatsword", "FerrousShadow", "ForestRegalia", "KatsuragikiriNagamasa", "LithicBlade", "LuxuriousSeaLord", "MakhairaAquamarine", "OldMercsPal", "PrototypeArchaic", "Rainslasher", "RedhornStonethresher", "RoyalGreatsword", "SacrificialGreatsword", "SerpentSpine", "SkyriderGreatsword", "SkywardPride", "SnowTombedStarsilver", "SongOfBrokenPines", "TheBell", "TheUnforged", "WasterGreatsword", "Whiteblind", "WhiteIronGreatsword", "WolfsGravestone"];
const allWeaponPolearmKeys = ["BeginnersProtector", "BlackcliffPole", "BlackTassel", "CalamityQueller", "CrescentPike", "Deathmatch", "DragonsBane", "DragonspineSpear", "EngulfingLightning", "FavoniusLance", "Halberd", "IronPoint", "KitainCrossSpear", "LithicSpear", "MissiveWindspear", "Moonpiercer", "PrimordialJadeWingedSpear", "PrototypeStarglitter", "RoyalSpear", "SkywardSpine", "StaffOfHoma", "StaffOfTheScarletSands", "TheCatch", "VortexVanquisher", "WavebreakersFin", "WhiteTassel"];
const allWeaponBowKeys = ["AlleyHunter", "AmosBow", "AquaSimulacra", "BlackcliffWarbow", "CompoundBow", "ElegyForTheEnd", "EndOfTheLine", "FadingTwilight", "FavoniusWarbow", "Hamayumi", "HuntersBow", "HuntersPath", "KingsSquire", "Messenger", "MitternachtsWaltz", "MouunsMoon", "PolarStar", "Predator", "PrototypeCrescent", "RavenBow", "RecurveBow", "RoyalBow", "Rust", "SacrificialBow", "SeasonedHuntersBow", "SharpshootersOath", "SkywardHarp", "Slingshot", "TheStringless", "TheViridescentHunt", "ThunderingPulse", "WindblumeOde"];
const allWeaponCatalystKeys = ["ApprenticesNotes", "AThousandFloatingDreams", "BlackcliffAgate", "DodocoTales", "EmeraldOrb", "EverlastingMoonglow", "EyeOfPerception", "FavoniusCodex", "Frostbearer", "FruitOfFulfillment", "HakushinRing", "KagurasVerity", "LostPrayerToTheSacredWinds", "MagicGuide", "MappaMare", "MemoryOfDust", "OathswornEye", "OtherworldlyStory", "PocketGrimoire", "PrototypeAmber", "RoyalGrimoire", "SacrificialFragments", "SkywardAtlas", "SolarPearl", "TheWidsith", "ThrillingTalesOfDragonSlayers", "TulaytullahsRemembrance", "TwinNephrite", "WanderingEvenstar", "WineAndSong"];
const allWeaponKeys = [...allWeaponSwordKeys, ...allWeaponClaymoreKeys, ...allWeaponPolearmKeys, ...allWeaponBowKeys, ...allWeaponCatalystKeys];
const weaponMaxLevel = {
  1: 70,
  2: 70,
  3: 90,
  4: 90,
  5: 90
};
;// CONCATENATED MODULE: ../../libs/consts/src/index.ts




;// CONCATENATED MODULE: ./src/app/Types/consts.ts

const allHitModes = (/* unused pure expression or super */ null && (["hit", "avgHit", "critHit"]));
const allAmpReactions = (/* unused pure expression or super */ null && (["vaporize", "melt"]));
const allAdditiveReactions = (/* unused pure expression or super */ null && (["spread", "aggravate"]));
const allArtifactSetCount = (/* unused pure expression or super */ null && ([1, 2, 3, 4, 5]));
const allArtifactRarities = (/* unused pure expression or super */ null && ([5, 4, 3]));
/**
 * @deprecated
 */
const consts_allSlotKeys = ["flower", "plume", "sands", "goblet", "circlet"];
/**
 * @deprecated
 */
const consts_allElements = ['anemo', 'geo', 'electro', 'hydro', 'pyro', 'cryo', 'dendro'];
/**
 * @deprecated
 */
const consts_allElementsWithPhy = ["physical", ...consts_allElements];
const allInfusionAuraElements = (/* unused pure expression or super */ null && (["pyro", 'cryo', 'hydro']));
/**
 * @deprecated
 */
const consts_allWeaponTypeKeys = (/* unused pure expression or super */ null && (['sword', 'claymore', 'polearm', 'bow', 'catalyst']));
const allRollColorKeys = (/* unused pure expression or super */ null && (['roll1', 'roll2', 'roll3', 'roll4', 'roll5', 'roll6']));
const allAscension = (/* unused pure expression or super */ null && ([0, 1, 2, 3, 4, 5, 6]));
const allRefinement = (/* unused pure expression or super */ null && ([1, 2, 3, 4, 5]));
const substatType = (/* unused pure expression or super */ null && (["max", "mid", "min"]));
const consts_genderKeys = (/* unused pure expression or super */ null && (["F", "M"]));
const locationCharacterKeys = [...nonTravelerCharacterKeys, "Traveler"];
const travelerElements = (/* unused pure expression or super */ null && (["anemo", "geo", "electro", "dendro"]));
const travelerFKeys = ["TravelerAnemoF", "TravelerGeoF", "TravelerElectroF", "TravelerDendroF"];
const travelerMKeys = ["TravelerAnemoM", "TravelerGeoM", "TravelerElectroM", "TravelerDendroM"];
/**
 * @deprecated
 */
const consts_travelerKeys = ["TravelerAnemo", "TravelerGeo", "TravelerElectro", "TravelerDendro"];
/**
 * @deprecated
 */
const consts_allCharacterKeys = [...nonTravelerCharacterKeys, ...consts_travelerKeys];
const allCharacterSheetKeys = [...nonTravelerCharacterKeys, ...travelerFKeys, ...travelerMKeys];

/**
 * @deprecated
 */
const consts_allWeaponKeys = [...allWeaponSwordKeys, ...allWeaponClaymoreKeys, ...allWeaponPolearmKeys, ...allWeaponBowKeys, ...allWeaponCatalystKeys];
/**
 * @deprecated
 */

const characterSpecializedStatKeys = (/* unused pure expression or super */ null && (["hp_", "atk_", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"]));
const absorbableEle = (/* unused pure expression or super */ null && (["hydro", "pyro", "cryo", "electro"]));
const allowedAmpReactions = {
  pyro: ["vaporize", "melt"],
  hydro: ["vaporize"],
  cryo: ["melt"],
  anemo: ["vaporize", "melt"]
};
const allowedAdditiveReactions = {
  dendro: ["spread"],
  electro: ["aggravate"],
  anemo: ["aggravate"]
};
function charKeyToLocCharKey(charKey) {
  if (consts_travelerKeys.includes(charKey)) return "Traveler";
  return charKey;
}
function TravelerToElement(key, element) {
  return "Traveler" + element.toUpperCase().slice(0, 1) + element.slice(1);
}
function charKeyToCharName(ck, gender) {
  return ck.startsWith("Traveler") ? "Traveler" + gender : ck;
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/common.ts





function pruneAll(nodes, minimum, arts, numTop, exclusion, forced) {
  let should = forced;
  /** If `key` makes progress, all operations in `value` should be performed */
  const deps = {
    pruneOrder: {
      pruneNodeRange: true
    },
    pruneArtRange: {
      pruneNodeRange: true
    },
    pruneNodeRange: {
      reaffine: true
    },
    reaffine: {
      pruneOrder: true,
      pruneArtRange: true,
      pruneNodeRange: true
    }
  };
  let count = 0;
  while (Object.values(should).some(x => x) && count++ < 20) {
    if (should.pruneOrder) {
      delete should.pruneOrder;
      const newArts = pruneOrder(arts, numTop, exclusion);
      if (arts !== newArts) {
        arts = newArts;
        should = Object.assign({}, should, deps.pruneOrder);
      }
    }
    if (should.pruneArtRange) {
      delete should.pruneArtRange;
      const newArts = pruneArtRange(nodes, arts, minimum);
      if (arts !== newArts) {
        arts = newArts;
        should = Object.assign({}, should, deps.pruneArtRange);
      }
    }
    if (should.pruneNodeRange) {
      delete should.pruneNodeRange;
      const newNodes = pruneNodeRange(nodes, arts);
      if (nodes !== newNodes) {
        nodes = newNodes;
        should = Object.assign({}, should, deps.pruneNodeRange);
      }
    }
    if (should.reaffine) {
      delete should.reaffine;
      const {
        nodes: newNodes,
        arts: newArts
      } = reaffine(nodes, arts);
      if (nodes !== newNodes || arts !== newArts) {
        nodes = newNodes;
        arts = newArts;
        should = Object.assign({}, should, deps.reaffine);
      }
    }
  }
  return {
    nodes,
    arts
  };
}
function pruneExclusion(nodes, exclusion) {
  const maxValues = {};
  for (const [key, e] of Object.entries(exclusion)) {
    if (!e.includes(4)) continue;
    maxValues[key] = e.includes(2) ? 1 : 3;
  }
  return mapFormulas(nodes, f => f, f => {
    if (f.operation !== "threshold") return f;
    const [v, t, pass, fail] = f.operands;
    if (v.operation === "read" && t.operation === "const") {
      const key = v.path[v.path.length - 1],
        thres = t.value;
      if (key in maxValues) {
        const max = maxValues[key];
        if (max < thres) return fail;
        if (thres === 2 && exclusion[key].includes(2)) return threshold(v, 4, pass, fail);
      }
    }
    return f;
  });
}
function reaffine(nodes, arts, forceRename = false) {
  const affineNodes = new Set(),
    topLevelAffine = new Set();
  function visit(node, isAffine) {
    if (isAffine) affineNodes.add(node);else node.operands.forEach(op => affineNodes.has(op) && topLevelAffine.add(op));
  }
  const dynKeys = new Set();
  forEachNodes(nodes, _ => {}, f => {
    const {
      operation
    } = f;
    switch (operation) {
      case "read":
        dynKeys.add(f.path[1]);
        visit(f, true);
        break;
      case "add":
        visit(f, f.operands.every(op => affineNodes.has(op)));
        break;
      case "mul":
        {
          const nonConst = f.operands.filter(op => op.operation !== "const");
          visit(f, nonConst.length === 0 || nonConst.length === 1 && affineNodes.has(nonConst[0]));
          break;
        }
      case "const":
        visit(f, true);
        break;
      case "res":
      case "threshold":
      case "sum_frac":
      case "max":
      case "min":
        visit(f, false);
        break;
      default:
        assertUnreachable(operation);
    }
  });
  if ([...topLevelAffine].every(({
    operation
  }) => operation === "read" || operation === "const") && Object.keys(arts.base).length === dynKeys.size) return {
    nodes,
    arts
  };
  let current = -1;
  function nextDynKey() {
    while (dynKeys.has(`${++current}`));
    return `${current}`;
  }
  nodes.forEach(node => affineNodes.has(node) && topLevelAffine.add(node));
  const affine = [...topLevelAffine].filter(f => f.operation !== "const");
  const affineMap = new Map(affine.map(node => [node, !forceRename && node.operation === "read" && node.path[0] === "dyn" ? node : Object.assign({}, customRead(["dyn", `${nextDynKey()}`]), {
    accu: "add"
  })]));
  nodes = internal_mapFormulas(nodes, f => {
    var _affineMap$get;
    return (_affineMap$get = affineMap.get(f)) != null ? _affineMap$get : f;
  }, f => f);
  function reaffineArt(stat) {
    const values = constantFold([...affineMap.keys()], {
      dyn: objectMap(stat, value => constant(value))
    }, _ => true);
    return Object.fromEntries([...affineMap.values()].map((v, i) => [v.path[1], values[i].value]));
  }
  const result = {
    nodes,
    arts: {
      base: reaffineArt(arts.base),
      values: Util_objectKeyMap(consts_allSlotKeys, slot => arts.values[slot].map(({
        id,
        set,
        values
      }) => ({
        id,
        set,
        values: reaffineArt(values)
      })))
    }
  };
  const offsets = Object.entries(reaffineArt({}));
  for (const _arts of Object.values(result.arts.values)) for (const {
    values
  } of _arts) for (const [key, baseValue] of offsets) values[key] -= baseValue;
  return result;
}
/** Remove artifacts that cannot be in top `numTop` builds */
function pruneOrder(arts, numTop, exclusion) {
  var _exclusion$rainbow;
  let progress = false;
  /**
   * Note:
   * This function assumes that every base (reaffined) stats are monotonically increasing. That is, artifacts
   * with higher stats are better. This remains true as long as the main and substats are in increasing. Set
   * effects that decrease enemy resistance (which is monotonically decreasing) does not violate this assumption
   * as set effects are not handled here.
   */
  const allowRainbow = !((_exclusion$rainbow = exclusion.rainbow) != null && _exclusion$rainbow.length),
    keys = Object.keys(arts.base);
  const noSwitchIn = new Set(Object.entries(exclusion).filter(([_, v]) => v.length).map(([k]) => k));
  const noSwitchOut = new Set(Object.entries(exclusion).filter(([_, v]) => v.includes(2) && !v.includes(4)).map(([k]) => k));
  const values = Util_objectKeyMap(consts_allSlotKeys, slot => {
    const list = arts.values[slot];
    const newList = list.filter(art => {
      let count = 0;
      return list.every(other => {
        const otherBetterEqual = keys.every(k => {
          var _other$values$k, _art$values$k;
          return ((_other$values$k = other.values[k]) != null ? _other$values$k : 0) >= ((_art$values$k = art.values[k]) != null ? _art$values$k : 0);
        });
        const otherMaybeBetter = keys.some(k => {
          var _other$values$k2, _art$values$k2;
          return ((_other$values$k2 = other.values[k]) != null ? _other$values$k2 : 0) > ((_art$values$k2 = art.values[k]) != null ? _art$values$k2 : 0);
        });
        const otherBetter = otherBetterEqual && (otherMaybeBetter || other.id > art.id);
        const canSwitch = allowRainbow && !noSwitchIn.has(other.set) && !noSwitchOut.has(art.set) || art.set === other.set;
        if (otherBetter && canSwitch) count++;
        return count < numTop;
      });
    });
    if (newList.length !== list.length) progress = true;
    return newList;
  });
  return progress ? {
    base: arts.base,
    values
  } : arts;
}
/** Remove artifacts that cannot reach `minimum` in any build */
function pruneArtRange(nodes, arts, minimum) {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, {
    min: x,
    max: x
  }]));
  const wrap = {
    arts
  };
  while (true) {
    const artRanges = Util_objectKeyMap(consts_allSlotKeys, slot => computeArtRange(wrap.arts.values[slot]));
    const otherArtRanges = Util_objectKeyMap(consts_allSlotKeys, key => addArtRange(Object.entries(artRanges).map(a => a[0] === key ? baseRange : a[1]).filter(x => x)));
    let progress = false;
    const values = Util_objectKeyMap(consts_allSlotKeys, slot => {
      const result = wrap.arts.values[slot].filter(art => {
        const read = addArtRange([computeArtRange([art]), otherArtRanges[slot]]);
        const newRange = computeNodeRange(nodes, read);
        return nodes.every((node, i) => {
          var _minimum$i;
          return newRange.get(node).max >= ((_minimum$i = minimum[i]) != null ? _minimum$i : -Infinity);
        });
      });
      if (result.length !== wrap.arts.values[slot].length) progress = true;
      return result;
    });
    if (!progress) break;
    wrap.arts = {
      base: wrap.arts.base,
      values
    };
  }
  return wrap.arts;
}
function pruneNodeRange(nodes, arts) {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, {
    min: x,
    max: x
  }]));
  const reads = addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))]);
  const nodeRange = computeNodeRange(nodes, reads);
  return internal_mapFormulas(nodes, f => {
    {
      const {
        min,
        max
      } = nodeRange.get(f);
      if (min === max) return constant(min);
    }
    const {
      operation
    } = f;
    const operandRanges = f.operands.map(x => nodeRange.get(x));
    switch (operation) {
      case "threshold":
        {
          const [value, threshold, pass, fail] = operandRanges;
          if (value.min >= threshold.max) return f.operands[2];else if (value.max < threshold.min) return f.operands[3];
          if (pass.max === pass.min && fail.max === fail.min && pass.min === fail.min && isFinite(pass.min)) return constant(pass.max);
          break;
        }
      case "min":
        {
          const newOperands = f.operands.filter((_, i) => {
            const op1 = operandRanges[i];
            return operandRanges.every((op2, j) => op1.min <= op2.max);
          });
          if (newOperands.length < operandRanges.length) return min(...newOperands);
          break;
        }
      case "max":
        {
          const newOperands = f.operands.filter((_, i) => {
            const op1 = operandRanges[i];
            return operandRanges.every(op2 => op1.max >= op2.min);
          });
          if (newOperands.length < operandRanges.length) return max(...newOperands);
          break;
        }
    }
    return f;
  }, f => f);
}
function addArtRange(ranges) {
  const result = {};
  ranges.forEach(range => {
    Object.entries(range).forEach(([key, value]) => {
      if (result[key]) {
        result[key].min += value.min;
        result[key].max += value.max;
      } else result[key] = Object.assign({}, value);
    });
  });
  return result;
}
function computeArtRange(arts) {
  const result = {};
  if (arts.length) {
    Object.keys(arts[0].values).filter(key => arts.every(art => art.values[key])).forEach(key => result[key] = {
      min: arts[0].values[key],
      max: arts[0].values[key]
    });
    arts.forEach(({
      values
    }) => {
      for (const [key, value] of Object.entries(values)) {
        if (!result[key]) result[key] = {
          min: 0,
          max: value
        };else {
          if (result[key].max < value) result[key].max = value;
          if (result[key].min > value) result[key].min = value;
        }
      }
    });
  }
  return result;
}
function computeFullArtRange(arts) {
  const baseRange = Object.fromEntries(Object.entries(arts.base).map(([key, x]) => [key, {
    min: x,
    max: x
  }]));
  return addArtRange([baseRange, ...Object.values(arts.values).map(values => computeArtRange(values))]);
}
function computeNodeRange(nodes, reads) {
  const range = new Map();
  forEachNodes(nodes, _ => {}, f => {
    var _reads$f$path$;
    const {
      operation
    } = f;
    const operands = f.operands.map(op => range.get(op));
    let current;
    switch (operation) {
      case "read":
        if (f.path[0] !== "dyn") throw new Error(`Found non-dyn path ${f.path} while computing range`);
        current = (_reads$f$path$ = reads[f.path[1]]) != null ? _reads$f$path$ : {
          min: 0,
          max: 0
        };
        break;
      case "const":
        current = computeMinMax([f.value]);
        break;
      case "add":
      case "min":
      case "max":
        current = {
          min: allOperations[operation](operands.map(x => x.min)),
          max: allOperations[operation](operands.map(x => x.max))
        };
        break;
      case "res":
        current = {
          min: allOperations[operation]([operands[0].max]),
          max: allOperations[operation]([operands[0].min])
        };
        break;
      case "mul":
        current = operands.reduce((accu, current) => computeMinMax([accu.min * current.min, accu.min * current.max, accu.max * current.min, accu.max * current.max]));
        break;
      case "threshold":
        if (operands[0].min >= operands[1].max) current = operands[2];else if (operands[0].max < operands[1].min) current = operands[3];else current = computeMinMax([], [operands[2], operands[3]]);
        break;
      case "sum_frac":
        {
          const [x, c] = operands,
            sum = {
              min: x.min + c.min,
              max: x.max + c.max
            };
          if (sum.min <= 0 && sum.max >= 0) current = x.min <= 0 && x.max >= 0 ? {
            min: NaN,
            max: NaN
          } : {
            min: -Infinity,
            max: Infinity
          };else
            // TODO: Check this
            current = computeMinMax([x.min / sum.min, x.min / sum.max, x.max / sum.min, x.max / sum.max]);
          break;
        }
      default:
        assertUnreachable(operation);
    }
    range.set(f, current);
  });
  return range;
}
function computeMinMax(values, minMaxes = []) {
  const max = Math.max(...values, ...minMaxes.map(x => x.max));
  const min = Math.min(...values, ...minMaxes.map(x => x.min));
  return {
    min,
    max
  };
}
function filterArts(arts, filters) {
  return {
    base: arts.base,
    values: Util_objectKeyMap(consts_allSlotKeys, slot => {
      const filter = filters[slot];
      switch (filter.kind) {
        case "id":
          return arts.values[slot].filter(art => filter.ids.has(art.id));
        case "exclude":
          return arts.values[slot].filter(art => !filter.sets.has(art.set));
        case "required":
          return arts.values[slot].filter(art => filter.sets.has(art.set));
      }
    })
  };
}
function mergeBuilds(builds, maxNum) {
  return builds.flatMap(x => x).sort((a, b) => b.value - a.value).slice(0, maxNum);
}
function mergePlot(plots) {
  let scale = 0.01,
    reductionScaling = 2,
    maxCount = 1500;
  let keys = new Set(plots.flatMap(x => Object.values(x).map(v => Math.round(v.plot / scale))));
  while (keys.size > maxCount) {
    scale *= reductionScaling;
    keys = new Set([...keys].map(key => Math.round(key / reductionScaling)));
  }
  const result = {};
  for (const plot of plots) for (const build of Object.values(plot)) {
    const x = Math.round(build.plot / scale) * scale;
    if (!result[x] || result[x].value < build.value) result[x] = build;
  }
  return result;
}
function countBuilds(arts) {
  return consts_allSlotKeys.reduce((_count, slot) => _count * arts.values[slot].length, 1);
}
function* filterFeasiblePerm(filters, _artSets) {
  const artSets = objectMap(_artSets.values, values => new Set(values.map(v => v.set)));
  filter_loop: for (const filter of filters) {
    for (const [slot, f] of Object.entries(filter)) {
      const available = artSets[slot];
      switch (f.kind) {
        case "required":
          if ([...f.sets].every(s => !available.has(s))) continue filter_loop;
          break;
        case "exclude":
          if ([...available].every(s => f.sets.has(s))) continue filter_loop;
          break;
        case "id":
          break;
      }
    }
    yield filter;
  }
}
function exclusionToAllowed(exclusion) {
  return new Set(exclusion != null && exclusion.includes(2) ? exclusion.includes(4) ? [0, 1] : [0, 1, 4, 5] : exclusion != null && exclusion.includes(4) ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5]);
}
/** A *disjoint* set of `RequestFilter` satisfying the exclusion rules */
function* artSetPerm(exclusion, _artSets) {
  /**
   * This generation algorithm is separated into two parts:
   * - "Shape" generation
   *   - It first generates all build "shapes", e.g., AABBC, ABBCD
   *   - It then filters the generated shapes according to the rainbow exclusion, e.g., removes ABBCD if excluding 3 rainbows
   *   - It then merges the remaining shapes into wildcards, e.g. AABAA + AABAB + AABAC => AABA*
   * - Shape filling
   *   - From the given shapes, it tries to fill in all non-rainbow slots, e.g., slots A and B of AABBC, with actual artifacts
   *   - It then fills the rainbow slots, e.g., slot C of AABBC while ensuring the exclusion rule of each sets
   */
  const artSets = [...new Set(_artSets)],
    allowedRainbows = exclusionToAllowed(exclusion.rainbow);
  let shapes = [];
  function populateShapes(current, list, rainbows) {
    if (current.length === 5) {
      if (allowedRainbows.has(rainbows.length)) shapes.push(current);
      return;
    }
    for (const i of list) populateShapes([...current, i], list, rainbows.filter(j => j !== i));
    populateShapes([...current, current.length], new Set([...list, current.length]), [...rainbows, current.length]);
  }
  populateShapes([0], new Set([0]), [0]);
  function indexOfShape(shape, replacing) {
    if (range(replacing + 1, 4).some(i => shape[i] !== 5)) return undefined;
    shape = [...shape];
    shape[replacing] = 5;
    return shape.reduce((a, b) => a * 6 + b, 0);
  }
  for (let replacing = 4; replacing >= 0; replacing--) {
    const required = new Map();
    for (const shape of shapes) {
      var _required$get;
      const id = indexOfShape(shape, replacing);
      if (id === undefined) continue;
      required.set(id, ((_required$get = required.get(id)) != null ? _required$get : new Set(shape.slice(0, replacing)).size + 1) - 1);
    }
    for (const [id, remaining] of required.entries()) {
      if (remaining === 0) {
        const shape = [...shapes.find(shape => indexOfShape(shape, replacing) === id)];
        shape[replacing] = 5;
        shapes = shapes.filter(shape => indexOfShape(shape, replacing) !== id);
        shapes.push(shape);
      }
    }
  }

  // Shapes are now calculated and merged, proceed to fill in the sets

  const noFilter = {
    kind: "exclude",
    sets: new Set()
  };
  const result = Util_objectKeyMap(consts_allSlotKeys, _ => noFilter);
  const counts = Object.assign({}, objectMap(exclusion, _ => 0), Util_objectKeyMap(artSets, _ => 0));
  const allowedCounts = objectMap(exclusion, exclusionToAllowed);
  function* check(shape) {
    const used = new Set();
    let groupped = [],
      rainbows = [];
    for (const i of shape) {
      groupped.push([]);
      if (i === 5) rainbows.push(groupped.length - 1);else groupped[i].push(groupped.length - 1);
    }
    groupped = groupped.filter(v => v.length).sort((a, b) => b.length - a.length);
    let usableRainbows = rainbows.length;

    // Inception.. because js doesn't like functions inside a for-loop
    function* check(i) {
      if (i === groupped.length) return yield* check_free(0);
      for (const set of artSets) {
        if (used.has(set)) continue;
        const length = groupped[i].length,
          allowedSet = allowedCounts[set];
        let requiredRainbows = 0;
        if (allowedSet && !allowedSet.has(length)) {
          var _range$find;
          // Look ahead and see if we have enough rainbows to fill to the next `allowedSet` if we use the current set
          requiredRainbows = ((_range$find = range(length + 1, 5).find(l => allowedSet.has(l))) != null ? _range$find : 6) - length;
          if (requiredRainbows > usableRainbows) continue; // Not enough rainbows. Next..
        }

        used.add(set);
        counts[set] = groupped[i].length;
        groupped[i].forEach(j => result[consts_allSlotKeys[j]] = {
          kind: "required",
          sets: new Set([set])
        });
        usableRainbows -= requiredRainbows;
        yield* check(i + 1);
        usableRainbows += requiredRainbows;
        counts[set] = 0;
        used.delete(set);
      }
    }
    // We separate filling rainbow slots from groupped slots because it has an entirely
    // different set of rules regarding what can be filled and what states to be kept.
    function* check_free(i) {
      const remaining = rainbows.length - i,
        isolated = [],
        missing = [],
        rejected = [];
      let required = 0;
      for (const set of artSets) {
        const allowedSet = allowedCounts[set],
          count = counts[set];
        if (!allowedSet) continue;
        if (range(1, remaining).every(j => !allowedSet.has(count + j))) rejected.push(set);else if (!allowedSet.has(count)) {
          required += [...allowedSet].find(x => x > count) - count;
          missing.push(set);
        } else if (range(0, remaining).some(j => !allowedSet.has(count + j))) isolated.push(set);
      }
      if (required > remaining) return;
      if (i === rainbows.length) {
        yield Object.assign({}, result);
        return;
      }
      if (required === remaining) {
        for (const set of missing) {
          counts[set]++;
          result[consts_allSlotKeys[rainbows[i]]] = {
            kind: "required",
            sets: new Set([set])
          };
          yield* check_free(i + 1);
          counts[set]--;
        }
        return;
      }
      for (const set of [...isolated, ...missing]) {
        counts[set]++;
        result[consts_allSlotKeys[rainbows[i]]] = {
          kind: "required",
          sets: new Set([set])
        };
        yield* check_free(i + 1);
        counts[set]--;
      }
      result[consts_allSlotKeys[rainbows[i]]] = {
        kind: "exclude",
        sets: new Set([...missing, ...rejected, ...isolated])
      };
      yield* check_free(i + 1);
    }
    yield* check(0);
  }
  for (const shape of shapes) yield* check(shape);
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/BNBSplitWorker.ts





class BNBSplitWorker {
  /**
   * Filters are not neccessarily in a valid state, i.e., "calculated".
   * We amortize the calculation to 1-per-split so that the calculation
   * overhead doesn't lead to lag.
   */

  constructor({
    arts,
    optimizationTarget,
    filters,
    maxBuilds
  }, callback) {
    this.min = void 0;
    this.nodes = void 0;
    this.arts = void 0;
    this.maxBuilds = void 0;
    this.filters = [];
    this.interim = void 0;
    this.firstUncalculated = 0;
    this.callback = void 0;
    this.arts = arts;
    this.min = [-Infinity, ...filters.map(x => x.min)];
    this.nodes = [optimizationTarget, ...filters.map(x => x.value)];
    this.callback = callback;
    this.maxBuilds = maxBuilds;

    // make sure we can approximate it
    linearUpperBound(this.nodes, arts);
  }
  addFilter(filter) {
    const arts = filterArts(this.arts, filter),
      count = countBuilds(arts);
    if (count) this.filters.push({
      nodes: this.nodes,
      arts,
      maxConts: [],
      approxs: [],
      age: 0,
      count
    });
  }
  split(newThreshold, minCount) {
    if (newThreshold > this.min[0]) {
      this.min[0] = newThreshold;
      // All calculations become stale
      this.firstUncalculated = 0;
      this.filters.forEach(filter => delete filter.calculated);
    }
    if (this.firstUncalculated < this.filters.length) this.calculateFilter(this.firstUncalculated++); // Amortize the filter calculation to 1-per-split

    while (this.filters.length) {
      const filter = this.getApproxFilter(),
        {
          arts,
          count
        } = filter;
      this.reportInterim(false);
      if (!count) continue;
      if (count <= minCount) {
        this.reportInterim(true);
        return objectMap(arts.values, arts => ({
          kind: "id",
          ids: new Set(arts.map(art => art.id))
        }));
      }
      this.splitOldFilter(filter);
    }
    this.reportInterim(true);
    return undefined;
  }
  reportInterim(forced = false) {
    if (this.interim && (this.interim.skipped > 1000000 || forced === true)) {
      this.callback(this.interim);
      this.interim = undefined;
    }
  }
  splitOldFilter({
    nodes,
    arts,
    approxs,
    age
  }) {
    /**
     * Split the artifacts in each slot into high/low main (index 0) contribution along 1/3 of the
     * contribution range. If the main contribution of a slot is in range 500-2000, the the high-
     * contibution artifact has contribution of at least 1500, and the rest are low-contribution.
     */
    const splitted = objectMap(arts.values, arts => {
      var _remaining$cont, _remaining;
      const remaining = arts.map(art => ({
        art,
        cont: approxs[0].conts[art.id]
      })).sort(({
        cont: c1
      }, {
        cont: c2
      }) => c2 - c1);
      const minCont = (_remaining$cont = (_remaining = remaining[remaining.length - 1]) == null ? void 0 : _remaining.cont) != null ? _remaining$cont : 0;
      let contCutoff = remaining.reduce((accu, {
        cont
      }) => accu + cont, -minCont * remaining.length) / 3;
      const index = Math.max(1, remaining.findIndex(({
        cont
      }) => (contCutoff -= cont - minCont) <= 0));
      const lowArts = remaining.splice(index).map(({
          art
        }) => art),
        highArts = remaining.map(({
          art
        }) => art);
      return {
        high: {
          arts: highArts,
          maxConts: approxs.map(approx => maxContribution(highArts, approx))
        },
        low: {
          arts: lowArts,
          maxConts: approxs.map(approx => maxContribution(lowArts, approx))
        }
      };
    });
    const remaining = Object.keys(splitted),
      {
        filters
      } = this;
    const current = {};
    const currentCont = {};
    function partialSplit(count) {
      if (!remaining.length) {
        const maxConts = approxs.map((_, i) => objectMap(currentCont, val => val[i]));
        const currentArts = {
          base: arts.base,
          values: Object.assign({}, current)
        };
        filters.push({
          nodes,
          arts: currentArts,
          maxConts,
          approxs,
          age: age + 1,
          count
        });
        return;
      }
      const slot = remaining.pop(),
        {
          high,
          low
        } = splitted[slot];
      if (low.arts.length) {
        current[slot] = low.arts;
        currentCont[slot] = low.maxConts;
        partialSplit(count * low.arts.length);
      }
      if (high.arts.length) {
        current[slot] = high.arts;
        currentCont[slot] = high.maxConts;
        partialSplit(count * high.arts.length);
      }
      remaining.push(slot);
    }
    partialSplit(1);
  }

  /** *Precondition*: `this.filters` must not be empty */
  getApproxFilter() {
    this.calculateFilter(this.filters.length - 1);
    if (this.firstUncalculated > this.filters.length) this.firstUncalculated = this.filters.length;
    return this.filters.pop();
  }
  /** Update calculate on filter at index `i` if not done so already */
  calculateFilter(i) {
    let {
      nodes,
      arts,
      maxConts,
      approxs,
      age,
      count: oldCount,
      calculated
    } = this.filters[i];
    if (calculated) return;
    if (age < 3 || age % 5 === 2) {
      // Make sure the condition includes initial filter `age === 0`
      // Either the filter is so early that we can get a good cutoff, or the problem has
      // gotten small enough that the old approximation becomes inaccurate
      ({
        nodes,
        arts
      } = pruneAll(nodes, this.min, arts, this.maxBuilds, {}, {
        pruneNodeRange: true
      }));
      if (Object.values(arts.values).every(x => x.length)) {
        approxs = approximation(nodes, arts);
        maxConts = approxs.map(approx => objectMap(arts.values, val => maxContribution(val, approx)));
      }
    }
    // Removing artifacts that doesn't meet the required opt target contributions.
    //
    // We could actually loop `newValues` computation if the removed artifacts have
    // the highest contribution in one of the target node as the removal will raise
    // the required contribution even further. However, once is generally enough.
    const leadingConts = maxConts.map((cont, i) => Object.values(cont).reduce((accu, val) => accu + val, approxs[i].base - this.min[i]));
    const newValues = objectMap(arts.values, (arts, slot) => {
      const requiredConts = leadingConts.map((lc, i) => maxConts[i][slot] - lc);
      return arts.filter(({
        id
      }) => approxs.every(({
        conts
      }, i) => conts[id] >= requiredConts[i]));
    });
    arts = {
      base: arts.base,
      values: newValues
    };
    const newCount = countBuilds(arts);
    if (newCount !== oldCount) if (this.interim) this.interim.skipped += oldCount - newCount;else this.interim = {
      command: "interim",
      buildValues: undefined,
      tested: 0,
      failed: 0,
      skipped: oldCount - newCount
    };
    this.filters[i] = {
      nodes,
      arts,
      maxConts,
      approxs,
      age,
      count: newCount,
      calculated: true
    };
  }
}
function maxContribution(arts, approximation) {
  return Math.max(...arts.map(({
    id
  }) => approximation.conts[id]));
}
function approximation(nodes, arts) {
  return linearUpperBound(nodes, arts).map(weight => ({
    base: dot(arts.base, weight, weight.$c),
    conts: objectKeyValueMap(Object.values(arts.values).flat(), data => [data.id, dot(data.values, weight, 0)])
  }));
}
function dot(values, lin, c) {
  return Object.entries(values).reduce((accu, [k, v]) => {
    var _lin$k;
    return accu + ((_lin$k = lin[k]) != null ? _lin$k : 0) * v;
  }, c);
}
function weightedSum(...entries) {
  const result = {};
  for (const [weight, entry] of entries) for (const [k, v] of Object.entries(entry)) {
    var _result$k;
    result[k] = ((_result$k = result[k]) != null ? _result$k : 0) + weight * v;
  }
  return result;
}
/** Compute a linear upper bound of `nodes` */
function linearUpperBound(nodes, arts) {
  const cents = weightedSum([1, arts.base], ...Object.values(arts.values).map(arts => [1 / arts.length, weightedSum(...arts.map(art => [1, art.values]))]));
  const getCent = lin => dot(cents, lin, lin.$c);
  const minMaxes = new Map();
  forEachNodes(nodes, f => {
    const {
      operation
    } = f;
    if (operation === "mul") minMaxes.set(f, {
      min: NaN,
      max: NaN
    });
    switch (operation) {
      case "mul":
      case "min":
      case "max":
      case "threshold":
      case "res":
      case "sum_frac":
        f.operands.forEach(op => minMaxes.set(op, {
          min: NaN,
          max: NaN
        }));
        break;
    }
  }, _ => _);
  const nodeRanges = computeNodeRange([...minMaxes.keys()], computeFullArtRange(arts));
  for (const [node, minMax] of nodeRanges.entries()) minMaxes.set(node, minMax);
  function slopePoint(slope, x0, y0, lin) {
    return weightedSum([1, {
      $c: y0 - slope * x0
    }], [slope, lin]);
  }
  function interpolate(x0, y0, x1, y1, lin, upper) {
    if (Math.abs(x0 - x1) < 1e-10) return {
      $c: upper ? Math.max(y0, y1) : Math.min(y0, y1)
    };
    return slopePoint((y1 - y0) / (x1 - x0), x0, y0, lin);
  }
  const upper = "u",
    lower = "l",
    outward = "o";
  return customMapFormula(nodes, upper, (f, context, _map) => {
    const {
      operation
    } = f;
    const map = (op, c = context) => _map(op, c);
    const oppositeContext = context === upper ? lower : upper;
    if (context === outward) {
      const {
        min,
        max
      } = minMaxes.get(f);
      if (min < 0 && max > 0)
        // TODO: We can bypass this restriction by converting `f`
        // to `min(f, 0)` or `max(f, 0)` as appropriate
        throw new PolyError("Zero-crossing", operation);
      return map(f, max <= 0 ? lower : upper);
    }
    switch (operation) {
      case "const":
        return {
          $c: f.value
        };
      case "read":
        return {
          $c: 0,
          [f.path[1]]: 1
        };
      case "add":
        return weightedSum(...f.operands.map(op => [1, map(op)]));
      case "min":
      case "max":
        {
          const op = allOperations[operation];
          const xs = f.operands.filter(op => op.operation !== "const"),
            [xOp] = xs;
          if (xs.length !== 1) throw new PolyError("Multivariate", operation);
          const x = map(xOp),
            c = op(f.operands.filter(op => op.operation === "const").map(c => c.value));
          if (operation === "max" && context === lower || operation === "min" && context === upper) return x;
          const {
              min,
              max
            } = minMaxes.get(xOp),
            yMin = op([min, c]),
            yMax = op([max, c]);
          return interpolate(min, yMin, max, yMax, x, context === upper);
        }
      case "res":
        {
          if (context !== upper) throw new PolyError("Unsupported direction", operation);
          const op = allOperations[operation];
          const [xOp] = f.operands,
            {
              min,
              max
            } = minMaxes.get(xOp);
          const x = map(xOp, oppositeContext);
          // Linear region 1 - base/2 or concave region with peak at base = 0
          if (min < 0 && max < 1.75) return weightedSum([1, {
            $c: 1
          }], [-0.5, x]);
          // Clamp `min` to guarantee upper bound
          else return interpolate(min, op([min]), max, op([max]), x, context === upper);
        }
      case "sum_frac":
        {
          if (context !== upper) throw new PolyError("Unsupported direction", operation);
          const [xOp, cOp] = f.operands;
          if (cOp.operation !== "const") throw new PolyError("Non-constant node", operation);
          const x = map(xOp),
            c = cOp.value,
            {
              min,
              max
            } = minMaxes.get(xOp);
          const loc = Math.sqrt((min + c) * (max + c));
          if (min <= -c) throw new PolyError("Unsupported pattern", operation);
          return slopePoint(c / (c + loc) / (c + loc), loc, loc / (loc + c), x);
        }
      case "threshold":
        {
          const [vOp, tOp, pOp, fOp] = f.operands;
          if (fOp.operation !== "const" || tOp.operation !== "const") throw new PolyError("Non-constant node", operation);
          if (pOp.operation !== "const") {
            if (fOp.value !== 0) throw new PolyError("Unsupported pattern", operation);
            const threshOp = utils_threshold(vOp, tOp, 1, fOp),
              mulOp = prod(threshOp, pOp);
            // Populate `minMaxes` to ensure consistency
            const {
              min: _min,
              max: _max
            } = minMaxes.get(pOp);
            minMaxes.set(threshOp, {
              min: 0,
              max: 1
            });
            minMaxes.set(mulOp, {
              min: Math.min(_min, 0),
              max: Math.max(_max, 0)
            });
            return map(mulOp);
          }
          const {
            min,
            max
          } = minMaxes.get(vOp);
          const thresh = tOp.value,
            pass = pOp.value,
            fail = fOp.value;
          const isFirstHalf = pass > fail === (context === upper);
          const v = map(vOp, pass > fail ? context : oppositeContext);
          const yThresh = isFirstHalf ? pass : fail;
          const slope = (pass - fail) / (isFirstHalf ? thresh - min : max - thresh);
          return slopePoint(slope, thresh, yThresh, v);
        }
      case "mul":
        {
          const {
            min,
            max
          } = minMaxes.get(f);
          if (min < 0 && max > 0) throw new PolyError("Zero-crossing", operation);
          if (min < 0 && context !== lower || max > 0 && context !== upper) throw new PolyError("Unsupported direction", operation);

          // For x/a >= 0, sum{x/a} <= n, and k > 0, it follows that
          //
          //   k prod{x} <= k/n prod{a} sum{x/a}
          //
          // This follows from AM-GM; prod{x/a} <= (sum{x/a}/n)^n <= sum{x/a}/n
          const operands = [...f.operands],
            flattenedOperands = [];
          let coeff = 1;
          while (operands.length) {
            const operand = operands.pop();
            if (operand.operation === "mul") operands.push(...operand.operands);else if (operand.operation === "const") coeff *= operand.value;else flattenedOperands.push(operand);
          }
          const lins = flattenedOperands.map(op => map(op, outward));
          const ranges = flattenedOperands.map(op => minMaxes.get(op));

          // Set `a` to the centroid of `x`, normalizing so that `sum{x/a} = n`
          const cents = lins.map(getCent);
          const factor = cents.reduce((accu, cent, i) => accu + (cent >= 0 ? ranges[i].max : ranges[i].min) / cent, 0);
          const prod = cents.reduce((a, b) => a * factor * b / lins.length, coeff / factor);
          return weightedSum(...lins.map((op, i) => [prod / cents[i], op]));
        }
      default:
        assertUnreachable(operation);
    }
  });
}
class PolyError extends Error {
  constructor(cause, operation) {
    super(`Found ${cause} in ${operation} node when generating polynomial upper bound`);
  }
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/ComputeWorker.ts


class ComputeWorker {
  constructor({
    arts,
    optimizationTarget,
    filters,
    plotBase,
    maxBuilds
  }, callback) {
    this.builds = [];
    this.buildValues = undefined;
    this.plotData = void 0;
    this.threshold = -Infinity;
    this.maxBuilds = void 0;
    this.min = void 0;
    this.arts = void 0;
    this.nodes = void 0;
    this.callback = void 0;
    this.interimReport = (count, forced = false) => {
      this.refresh(forced);
      this.callback(Object.assign({
        command: "interim",
        buildValues: this.buildValues
      }, count));
      this.buildValues = undefined;
      count.tested = 0;
      count.failed = 0;
      count.skipped = 0;
    };
    this.arts = arts;
    this.min = filters.map(x => x.min);
    this.maxBuilds = maxBuilds;
    this.callback = callback;
    this.nodes = filters.map(x => x.value);
    this.nodes.push(optimizationTarget);
    if (plotBase) {
      this.plotData = {};
      this.nodes.push(plotBase);
    }
    this.nodes = optimize(this.nodes, {}, _ => false);
  }
  compute(newThreshold, filter) {
    if (this.threshold > newThreshold) this.threshold = newThreshold;
    const {
        min,
        interimReport
      } = this,
      self = this; // `this` in nested functions means different things
    let preArts = filterArts(this.arts, filter);
    const totalCount = countBuilds(preArts),
      oldMaxBuildCount = this.builds.length;
    let nodes = this.nodes;
    ({
      nodes,
      arts: preArts
    } = pruneAll(nodes, min, preArts, this.maxBuilds, {}, {
      pruneArtRange: true,
      pruneNodeRange: true
    }));
    const arts = Object.values(preArts.values).sort((a, b) => a.length - b.length);
    const compute = precompute(nodes, preArts.base, f => f.path[1], arts.length);
    const buffer = Array(arts.length);
    const count = {
      tested: 0,
      failed: 0,
      skipped: totalCount - countBuilds(preArts)
    };
    function permute(i) {
      if (i < 0) {
        const result = compute(buffer);
        if (min.every((m, i) => m <= result[i])) {
          const value = result[min.length],
            {
              builds,
              plotData
            } = self;
          let build;
          if (value >= self.threshold) {
            build = {
              value,
              artifactIds: buffer.map(x => x.id).filter(id => id)
            };
            builds.push(build);
          }
          if (plotData) {
            const x = result[min.length + 1];
            if (!plotData[x] || plotData[x].value < value) {
              if (!build) build = {
                value,
                artifactIds: buffer.map(x => x.id).filter(id => id)
              };
              build.plot = x;
              plotData[x] = build;
            }
          }
        } else count.failed += 1;
        return;
      }
      arts[i].forEach(art => {
        buffer[i] = art;
        permute(i - 1);
      });
      if (i === 0) {
        count.tested += arts[0].length;
        if (count.tested > 1 << 16) interimReport(count);
      }
    }
    permute(arts.length - 1);
    interimReport(count, this.builds.length > oldMaxBuildCount);
  }
  refresh(force) {
    var _this$plotData;
    const {
      maxBuilds
    } = this;
    if (Object.keys((_this$plotData = this.plotData) != null ? _this$plotData : {}).length >= 100000) this.plotData = mergePlot([this.plotData]);
    if (this.builds.length >= 1000 || force) {
      var _this$buildValues;
      this.builds = this.builds.sort((a, b) => b.value - a.value).slice(0, maxBuilds);
      this.buildValues = this.builds.map(x => x.value);
      this.threshold = Math.max(this.threshold, (_this$buildValues = this.buildValues[maxBuilds - 1]) != null ? _this$buildValues : -Infinity);
    }
  }
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/DefaultSplitWorker.ts


class DefaultSplitWorker {
  constructor({
    arts
  }, _callback) {
    this.arts = void 0;
    this.filters = [];
    this.arts = arts;
  }
  addFilter(filter) {
    this.filters.push(filter);
  }
  split(_newThreshold, minCount) {
    while (this.filters.length) {
      const filter = this.filters.pop(),
        count = countBuilds(filterArts(this.arts, filter));
      if (count <= minCount) return filter;
      splitBySetOrID(this.arts, filter, minCount).forEach(filter => this.addFilter(filter));
    }
  }
}
function splitBySetOrID(_arts, filter, limit) {
  const arts = filterArts(_arts, filter);
  const candidates = consts_allSlotKeys.map(slot => ({
    slot,
    sets: new Set(arts.values[slot].map(x => x.set))
  })).filter(({
    sets
  }) => sets.size > 1);
  if (!candidates.length) return splitByID(arts, filter, limit);
  const {
    sets,
    slot
  } = candidates.reduce((a, b) => a.sets.size < b.sets.size ? a : b);
  return [...sets].map(set => Object.assign({}, filter, {
    [slot]: {
      kind: "required",
      sets: new Set([set])
    }
  }));
}
function splitByID(_arts, filter, limit) {
  const arts = filterArts(_arts, filter);
  const count = countBuilds(arts);
  const candidates = consts_allSlotKeys.map(slot => ({
    slot,
    length: arts.values[slot].length
  })).filter(x => x.length > 1);
  const {
    slot,
    length
  } = candidates.reduce((a, b) => a.length < b.length ? a : b);
  const numChunks = Math.ceil(count / limit);
  const boundedNumChunks = Math.min(numChunks, length);
  const chunk = Array(boundedNumChunks).fill(0).map(_ => new Set());
  arts.values[slot].forEach(({
    id
  }, i) => chunk[i % boundedNumChunks].add(id));
  return chunk.map(ids => Object.assign({}, filter, {
    [slot]: {
      kind: "id",
      ids
    }
  }));
}
;// CONCATENATED MODULE: ./src/app/PageCharacter/CharacterDisplay/Tabs/TabOptimize/BackgroundWorker.ts





let id, splitWorker, computeWorker;
onmessage = ({
  data
}) => {
  const {
    command
  } = data;
  let result;
  switch (command) {
    case "setup":
      {
        id = data.id;
        const splitID = `split${id}`,
          computeID = `compute${id}`;
        try {
          splitWorker = new BNBSplitWorker(data, interim => postMessage(Object.assign({
            id,
            source: splitID
          }, interim)));
        } catch (_unused) {
          splitWorker = new DefaultSplitWorker(data, interim => postMessage(Object.assign({
            id,
            source: splitID
          }, interim)));
        }
        computeWorker = new ComputeWorker(data, interim => postMessage(Object.assign({
          id,
          source: computeID
        }, interim)));
        result = {
          command: "iterate"
        };
        break;
      }
    case "split":
      {
        if (data.filter) splitWorker.addFilter(data.filter);
        const filter = splitWorker.split(data.threshold, data.minCount);
        result = {
          command: "split",
          filter
        };
        break;
      }
    case "iterate":
      {
        const {
          threshold,
          filter
        } = data;
        computeWorker.compute(threshold, filter);
        result = {
          command: "iterate"
        };
        break;
      }
    case "finalize":
      {
        computeWorker.refresh(true);
        const {
          builds,
          plotData
        } = computeWorker;
        result = {
          command: "finalize",
          builds,
          plotData
        };
        break;
      }
    case "count":
      {
        const {
            exclusion
          } = data,
          arts = computeWorker.arts;
        const setPerm = filterFeasiblePerm(artSetPerm(exclusion, [...new Set(Object.values(arts.values).flatMap(x => x.map(x => x.set)))]), arts);
        const counts = data.arts.map(_ => 0);
        for (const perm of setPerm) data.arts.forEach((arts, i) => counts[i] += countBuilds(filterArts(arts, perm)));
        result = {
          command: "count",
          counts
        };
        break;
      }
    default:
      assertUnreachable(command);
  }
  postMessage(Object.assign({
    id
  }, result));
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, [531], () => (__webpack_require__(312337)))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + "dc53120d066318a1" + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return undefined;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			337: 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e(531).then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ })()
;