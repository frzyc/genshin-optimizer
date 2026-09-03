import type { Tag } from './data/util'

/** Drop calc/runtime keys before meta lookup, display, or persistence. */
export function stripCalcContextTag(tag: Tag): Tag {
  const { src, dst, preset, ...rest } = tag as Tag & {
    src?: string | null
    dst?: string | null
    preset?: string | null
  }
  return rest
}
