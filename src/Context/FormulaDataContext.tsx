import { createContext, useCallback, useState } from "react";
import { NodeDisplay, UIData } from "../Formula/uiData";
import useBoolState from "../ReactHooks/useBoolState";

type FormulaDataContextObj = {
  data?: UIData,
  node?: NodeDisplay,
  modalOpen?: boolean,
  onModalOpen: () => void,
  onModalClose: () => void,
  setFormulaData: (data?: UIData, node?: NodeDisplay) => void
}
export const FormulaDataContext = createContext({ setFormulaData: () => { }, onModalOpen: () => { }, onModalClose: () => { } } as FormulaDataContextObj);

export function FormulaDataWrapper({ children }: { children: JSX.Element }) {
  const [open, onOpen, onClose] = useBoolState()
  const [[data, node], setState] = useState([undefined, undefined] as [data: UIData | undefined, node: NodeDisplay | undefined])
  const setFormulaData = useCallback((data?: UIData, node?: NodeDisplay) => {
    if (data && node) onOpen()
    else onClose()
    setState([data, node])
  }, [onOpen, onClose])
  return <FormulaDataContext.Provider value={{ setFormulaData, data, node, modalOpen: open, onModalOpen: onOpen, onModalClose: onClose }} >{children}</FormulaDataContext.Provider>
}
