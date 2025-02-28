import type { Tag } from '../tag'
import { customOps, type CustomInfo } from './custom'
export * from './arrayMap'
export * from './custom'

type DebugMode = boolean

let debugMode = false
export function setDebugMode(mode: DebugMode) {
  debugMode = mode
}
export function isDebug(_: 'calc' | 'tag_db'): boolean {
  return debugMode
}

export function assertUnreachable(value: never): never {
  throw new Error(`Should not reach this with value ${value}`)
}

export const tagString = (record: Tag): string =>
  `{ ${Object.entries(record)
    .map(([k, v]) => `${k}:${v}`)
    .join(' ')} }`

export const extract = <V, K extends keyof V>(arr: V[], key: K): V[K][] =>
  arr.map((v) => v[key])

export function addCustomOperation(name: string, info: CustomInfo) {
  if (name in customOps) throw new Error(`Already set custom formula: ${name}`)
  if (/^x\d+$/g.test(name))
    // this `name` may collides with temp variables in `compile`
    throw new Error(`Invalid custom operation name: ${name}`)
  customOps[name] = info
}
