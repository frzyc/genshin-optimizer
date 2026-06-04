import { CardThemed } from '@genshin-optimizer/common/ui'
import { HitModeToggle, ReactionToggle } from '@genshin-optimizer/gi/ui'
import { Box, CardContent, Divider } from '@mui/material'
import { OptimizationTargetControl } from './TargetHeroRow'

export function OptimizeCalcBar({ showTarget = true }: { showTarget?: boolean }) {
  return (
    <CardThemed bgt="light">
      <CardContent
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          py: 1,
          '&:last-child': { pb: 1 },
        }}
      >
        {showTarget && (
          <>
            <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
              <OptimizationTargetControl />
            </Box>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' }, alignSelf: 'stretch' }}
            />
          </>
        )}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            flex: showTarget ? '0 1 auto' : '1 1 auto',
            justifyContent: showTarget ? undefined : 'flex-end',
          }}
        >
          <HitModeToggle size="small" />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ alignSelf: 'stretch', display: { xs: 'none', md: 'block' } }}
          />
          <ReactionToggle size="small" />
        </Box>
      </CardContent>
    </CardThemed>
  )
}
