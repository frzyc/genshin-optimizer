import { reverseMap } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { Read } from '@genshin-optimizer/sr/formula'
export type DBRead = any

// Remap the member indexes to character key for db storage
export function toDBRead(
  read: Read,
  map: Record<'0' | '1' | '2' | '3', CharacterKey>
): DBRead {
  const tempRead = structuredClone(read)
  const { src, dst } = tempRead.tag
  const tag: any = tempRead.tag
  if (src) {
    tag.src = map[src]
  }
  if (dst) {
    tag.dest = map[dst]
  }
  return tempRead
}

export function toRead(
  dbRead: DBRead,
  map: Record<'0' | '1' | '2' | '3', CharacterKey>
): Read {
  const { src, dst } = dbRead.tag
  const tag: any = dbRead.tag
  const rmap = reverseMap(map)
  if (src) {
    tag.src = rmap[src as CharacterKey]
  }
  if (dst) {
    tag.dest = rmap[dst as CharacterKey]
  }
  return dbRead
}
