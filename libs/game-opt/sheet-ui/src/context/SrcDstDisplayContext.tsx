import type { ReactNode } from 'react'
import { createContext } from 'react'

export type SrcDstDisplayContextObj = {
  srcDisplay: Record<string, ReactNode>
  dstDisplay: Record<string, ReactNode>
  /**
   * When true (default), empty targeted conditionals can pick src.
   * When false, src is taken from TagContext (e.g. ZZZ teammate cards).
   */
  showSrcPicker?: boolean
  /**
   * When true (default), empty targeted conditionals can pick dst.
   * When false, hide the dst dropdown (e.g. ZZZ for now).
   */
  showDstPicker?: boolean
}
export const SrcDstDisplayContext = createContext<SrcDstDisplayContextObj>({
  srcDisplay: {},
  dstDisplay: {},
  showSrcPicker: true,
  showDstPicker: true,
})
