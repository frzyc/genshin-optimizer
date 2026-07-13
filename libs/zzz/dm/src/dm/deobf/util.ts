import { objKeyValMap } from '@genshin-optimizer/common/util'

export function generateMapping(
  reverseMapping: Record<string | number, string>,
  dmObj: Record<string, string | number | object>
) {
  return objKeyValMap(
    Object.entries(dmObj),
    ([k, v]) =>
      [
        k,
        reverseMapping[typeof v === 'object' ? JSON.stringify(v) : v],
      ] as const
  )
}

// Need to remove quotes when dumping into TS files so typings are correct instead of literal strings
export function generateTyping(
  reverseMapping: Record<string | number, string>,
  dmObj: Record<string, string | number | object>
) {
  return objKeyValMap(Object.values(dmObj), (v) => [
    reverseMapping[JSON.stringify(v)],
    typeof v,
  ])
}
