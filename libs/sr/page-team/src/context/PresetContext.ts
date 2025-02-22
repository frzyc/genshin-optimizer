import { createContext } from 'react'

export type PresetContextObj = {
  presetIndex: number
  setPresetIndex: (presetIndex: number) => void
}

export const PresetContext = createContext<PresetContextObj>({
  presetIndex: 0,
  setPresetIndex: () => {},
})
