import type { Team } from '@genshin-optimizer/gi/db'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import { EnemyExpandCard } from '@genshin-optimizer/gi/ui'
import { Box, Collapse, Divider } from '@mui/material'
import { ResonanceDisplay } from '../../TeamSetting/ResonanceDisplay'
import { TeamMembersEditor } from '../../TeamSetting/TeamMembersEditor'

export function TeamBuffsPanel({
  teamId,
  team,
  open,
  dataContextValue,
  charSelectIndex,
  onCharSelectIndex,
}: {
  teamId: string
  team: Team
  open: boolean
  dataContextValue?: dataContextObj
  charSelectIndex?: number
  onCharSelectIndex?: (index: number | undefined) => void
}) {
  const teamData = dataContextValue?.teamData

  return (
    <Collapse in={open}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <EnemyExpandCard teamId={teamId} />
        {dataContextValue && (
          <ResonanceDisplay
            teamId={teamId}
            team={team}
            dataContextValue={dataContextValue}
          />
        )}
        <Divider />
        <TeamMembersEditor
          teamId={teamId}
          teamData={teamData}
          charSelectIndex={charSelectIndex}
          onCharSelectIndex={onCharSelectIndex}
        />
      </Box>
    </Collapse>
  )
}
