import { createContext } from 'react'

export type SetConditionalFunc = (
  sheet: string,
  condKey: string,
  src: string,
  dst: string | null,
  value: number
) => void
export const SetConditionalContext = createContext<SetConditionalFunc>(() =>
  console.warn('SetConditional NOT IMPLEMENTED')
)
