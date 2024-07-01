import { CardThemed } from '@genshin-optimizer/common/ui'
import type { Tables } from '@genshin-optimizer/gi/supabase'
import { CardContent, Typography } from '@mui/material'
export function TeamCard({ team }: { team: Tables<'teams'> }) {
  return (
    <CardThemed>
      <CardContent>
        <Typography>{team.name ?? 'Team Name'}</Typography>
        <Typography>{team.description ?? 'Team Description'}</Typography>
      </CardContent>
    </CardThemed>
  )
}
