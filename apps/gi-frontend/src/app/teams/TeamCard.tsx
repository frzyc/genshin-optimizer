import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardContent, Typography } from '@mui/material'
import type { Team } from './getTeams'
export function TeamCard({ team }: { team: Team }) {
  return (
    <CardThemed>
      <CardContent>
        <Typography>{team.name ?? 'Team Name'}</Typography>
        <Typography>{team.description ?? 'Team Description'}</Typography>
      </CardContent>
    </CardThemed>
  )
}
