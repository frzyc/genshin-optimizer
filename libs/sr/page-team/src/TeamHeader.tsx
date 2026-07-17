import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { Box, Divider } from '@mui/material'
import { createContext, type MutableRefObject } from 'react'
import { ComboEditor } from './ComboEditor'
import { TeamCharacterSelector } from './TeamCharacterSelector'
import TeamNameCardHeader from './TeamNameCardHeader'
export const DEFAULT_HEADER_HEIGHT_PX = 210
export const HEADER_TOP_PX = 2
export const TeamHeaderHeightContext = createContext(DEFAULT_HEADER_HEIGHT_PX)
export function TeamHeader({
  teamId,
  characterKey,
  headerRef,
}: {
  teamId: string
  characterKey?: CharacterKey
  headerRef: MutableRefObject<HTMLElement | undefined>
}) {
  return (
    <Box
      ref={headerRef}
      sx={{
        overflow: 'visible',
        top: HEADER_TOP_PX,
        position: 'sticky',
        zIndex: 101,
      }}
    >
      <CardThemed
        sx={(theme) => ({ outline: `solid ${theme.palette.secondary.main}` })}
      >
        <TeamNameCardHeader />
        <Divider />
        <ComboEditor />
        <Divider />
        <TeamCharacterSelector teamId={teamId} charKey={characterKey} />
      </CardThemed>
    </Box>
  )
}
