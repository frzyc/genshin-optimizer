import type { Team } from '@genshin-optimizer/gi/db'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import { EnemyExpandCard } from '@genshin-optimizer/gi/ui'
import { Box, Collapse } from '@mui/material'
import { ResonanceDisplay } from '../../TeamSetting/ResonanceDisplay'
export function TeamBuffsPanel({
  teamId,
  team,
  open,
  dataContextValue,
}: {
  teamId: string
  team: Team
  open: boolean
  dataContextValue?: dataContextObj
}) {
  return (
    <Collapse in={open}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
        <EnemyExpandCard teamId={teamId} />
        {dataContextValue && (
          <ResonanceDisplay
            teamId={teamId}
            team={team}
            dataContextValue={dataContextValue}
          />
        )}
      </Box>
    </Collapse>
  )
}
