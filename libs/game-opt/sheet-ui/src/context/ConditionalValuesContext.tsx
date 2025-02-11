import { createContext } from 'react'

export type CondValue = {
  sheet: string
  condKey: string
  condValue: number
  src: string
  dst: string | null
}
export const ConditionalValuesContext = createContext<Array<CondValue>>([])
