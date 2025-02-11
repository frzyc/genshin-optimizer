import { createContext } from 'react'

export type CondValue = {
  sheet: string
  condKey: string
  condValue: number
  src: string | null
  dst: string | null
}
export const ConditionalValuesContext = createContext<Array<CondValue>>([])
