import type { Preset } from '@genshin-optimizer/sr/formula'
import { createContext } from 'react'

export type PresetContextObj = {
  preset: Preset
  setPreset: (preset: Preset) => void
}

export const PresetContext = createContext<PresetContextObj>({
  preset: 'preset0',
  setPreset: () => {},
})
