import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { Combo, ComboMetaDataum } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type ComboContextObj = {
  comboId: string
  combo: Combo
  comboMetadatum: ComboMetaDataum
  charMap: Record<'0' | '1' | '2' | '3', CharacterKey>
}

export const ComboContext = createContext({} as ComboContextObj)

export function useComboContext() {
  return useContext(ComboContext)
}
