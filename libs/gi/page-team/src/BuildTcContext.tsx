import type { BuildTc } from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
export type SetBuildTcAction =
  | Partial<BuildTc>
  | ((v: BuildTc) => Partial<BuildTc> | undefined)
export type BuildTcContexObj = {
  buildTc: BuildTc
  setBuildTc: (action: SetBuildTcAction) => void
}
export const BuildTcContext = createContext({} as BuildTcContexObj)
