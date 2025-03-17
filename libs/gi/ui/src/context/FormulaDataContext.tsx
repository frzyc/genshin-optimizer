'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CalcResult, UIData } from '@genshin-optimizer/gi/uidata'
import { createContext, useCallback, useState } from 'react'

type FormulaDataContextObj = {
  data?: UIData
  node?: CalcResult
  modalOpen?: boolean
  onModalOpen: () => void
  onModalClose: () => void
  setFormulaData: (data?: UIData, node?: CalcResult) => void
}
export const FormulaDataContext = createContext({
  setFormulaData: () => {},
  onModalOpen: () => {},
  onModalClose: () => {},
} as FormulaDataContextObj)

export function FormulaDataWrapper({ children }: { children: JSX.Element }) {
  const [open, onOpen, onClose] = useBoolState()
  const [[data, node], setState] = useState([undefined, undefined] as [
    data: UIData | undefined,
    node: CalcResult | undefined,
  ])
  const setFormulaData = useCallback(
    (data?: UIData, node?: CalcResult) => {
      if (data && node) onOpen()
      else onClose()
      setState([data, node])
    },
    [onOpen, onClose]
  )
  return (
    <FormulaDataContext.Provider
      value={{
        setFormulaData,
        data,
        node,
        modalOpen: open,
        onModalOpen: onOpen,
        onModalClose: onClose,
      }}
    >
      {children}
    </FormulaDataContext.Provider>
  )
}
