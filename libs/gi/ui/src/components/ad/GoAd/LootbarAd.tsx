import { NextImage } from '@genshin-optimizer/common/ui'
import { Link } from '@mui/material'
import { Box } from '@mui/system'
import type { ReactNode } from 'react'
import { lootbar } from '../../../assets'
import { LOOTBAR_LINK } from '../util'

export function LootbarAd({ children }: { children: ReactNode }) {
  return (
    <Box
      component={Link}
      href={LOOTBAR_LINK}
      target="_blank"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        minHeight: '100%',
        minWidth: '100%',
        height: '100%',
        gap: 1,
      }}
    >
      {children}
      <Box
        component={NextImage ? NextImage : 'img'}
        src={lootbar}
        maxWidth="100%"
        maxHeight="100%"
        width="100%"
        height="100%"
        sx={{ objectFit: 'contain' }}
      />
    </Box>
  )
}
export function canshowLootbarAd(height: number) {
  if (height > 120) return false
  return true
}
