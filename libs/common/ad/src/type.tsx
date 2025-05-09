import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import type { BoxProps } from '@mui/material'
import type { FunctionComponent, ReactNode } from 'react'

export type AdDims = { width?: number; height?: number }
export type AdComponent = FunctionComponent<{ children: ReactNode }>

export type AdProps = {
  sx?: BoxProps['sx']
  bgt?: CardBackgroundColor
  children: ReactNode
}
