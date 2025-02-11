import type { ReactNode } from 'react'
import { createContext } from 'react'

export type SrcDstDisplayContextObj = {
  srcDisplay: Record<string, ReactNode>
  dstDisplay: Record<string, ReactNode>
}
export const SrcDstDisplayContext = createContext<SrcDstDisplayContextObj>({
  srcDisplay: {},
  dstDisplay: {},
})
