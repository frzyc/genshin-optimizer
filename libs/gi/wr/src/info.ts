import type { Info } from './type'

/**
 * @deprecated
 * TODO: Remove
 */
export function info(key: string): Partial<Info> {
  return { path: key }
}
