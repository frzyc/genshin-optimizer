import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardActionArea, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import type { Team } from './getTeams'
export function TeamCard({ team }: { team: Team }) {
  return (
    <CardThemed>
      <CardActionArea component={Link} href={`/teams/${team.id}`}>
        <CardContent>
          <Typography>{team.name ?? 'Team Name'}</Typography>
          <Typography>{team.description ?? 'Team Description'}</Typography>
        </CardContent>
      </CardActionArea>
    </CardThemed>
  )
}
