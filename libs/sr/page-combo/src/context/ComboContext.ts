import type { Combo, ComboMetaDataum } from '@genshin-optimizer/sr/db'
import { createContext, useContext } from 'react'

export type ComboContextObj = {
  comboId: string
  combo: Combo
  comboMetadatum: ComboMetaDataum
}

export const ComboContext = createContext({} as ComboContextObj)

export function useComboContext() {
  return useContext(ComboContext)
}
