import { createContext, useEffect, useReducer } from "react"
import { dbStorage } from "./Database/DBStorage"

type GlobalSettings = {
  tcMode: boolean
}
type GlobalSettingsObject = {
  globalSettings: GlobalSettings,
  globalSettingsDispatch: (state: Partial<GlobalSettings>) => void
}
function initalGlobalSettings() {
  return { tcMode: false }
}
export const GlobalSettingsContext = createContext<GlobalSettingsObject>({
  globalSettings: initalGlobalSettings(),
  globalSettingsDispatch: () => { }
})

function globalSettingsReducer(state, action): GlobalSettings {
  return { ...state, ...action }
}

function initalGlobalSettingsWithStorage() {
  return dbStorage.get("GlobalSettings") ?? initalGlobalSettings()
}

export function useGlobalSettings() {
  const reducer = useReducer(globalSettingsReducer, undefined, initalGlobalSettingsWithStorage)
  const [globalSettings] = reducer
  useEffect(() => {
    dbStorage.set("GlobalSettings", globalSettings)
  }, [globalSettings])
  return reducer
}