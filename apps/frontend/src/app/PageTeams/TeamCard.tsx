import { CardThemed } from '@genshin-optimizer/common/ui'
import { Box, CardContent } from '@mui/material'
import { useTeam } from '@genshin-optimizer/gi/db-ui'

export default function TeamCard({
  teamId,
  onClick,
}: {
  teamId: string
  onClick: () => void
}) {
  const team = useTeam(teamId)
  if (!team) return null
  return (
    <CardThemed onClick={onClick}>
      <CardContent>
        <Box sx={{ overflowWrap: 'anywhere' }}>{JSON.stringify(team)}</Box>
      </CardContent>
    </CardThemed>
  )
}
