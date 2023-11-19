import { allElementWithPhyKeys } from '@genshin-optimizer/consts'
import type { Palette } from '@mui/material'

export function getVariant(key = ''): keyof Palette | undefined {
  //TODO: variants for other strings?
  // const trans = Object.keys(transformativeReactions).find((e) =>
  //   key.startsWith(e)
  // )
  // if (trans) return trans
  // const amp = Object.keys(amplifyingReactions).find((e) => key.startsWith(e))
  // if (amp) return amp
  // const add = Object.keys(additiveReactions).find((e) => key.startsWith(e))
  // if (add) return add
  if (key.includes('heal')) return 'heal'
  const ele = allElementWithPhyKeys.find((e) => key.startsWith(e))
  if (ele) return ele
  return undefined
}
