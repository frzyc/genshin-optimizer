import type { ICharTC } from '@genshin-optimizer/gi/db'
import { createContext } from 'react'
export type SetCharTCAction =
  | Partial<ICharTC>
  | ((v: ICharTC) => Partial<ICharTC> | void)
type CharTCContexObj = {
  charTC: ICharTC
  setCharTC: (action: SetCharTCAction) => void
}
export const CharTCContext = createContext({} as CharTCContexObj)
