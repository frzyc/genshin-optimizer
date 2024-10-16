import { createContext } from 'react'

export type FrameContextObj = {
  frameIndex: number
  setFrameIndex: (frameIndex: number) => void
}

export const FrameContext = createContext({
  frameIndex: 0,
  setFrameIndex: () => {},
} as FrameContextObj)
