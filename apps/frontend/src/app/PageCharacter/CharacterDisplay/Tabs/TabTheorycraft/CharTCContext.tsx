import { createContext } from 'react'
import type { ICharTC } from '../../../../Types/character'
export type SetCharTCAction =
  | Partial<ICharTC>
  | ((v: ICharTC) => Partial<ICharTC> | void)
type CharTCContexObj = {
  charTC: ICharTC
  setCharTC: (action: SetCharTCAction) => void
}
export const CharTCContext = createContext({} as CharTCContexObj)
