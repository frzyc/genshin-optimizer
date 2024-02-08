import { CardThemed } from '@genshin-optimizer/common/ui'
import { DatabaseContext } from '../Database/Database'
import { useContext } from 'react'
import { Box, CardContent } from '@mui/material'

export default function TeamCard({
  teamId,
  onClick,
}: {
  teamId: string
  onClick: () => void
}) {
  const { database } = useContext(DatabaseContext)
  const team = database.teams.get(teamId)
  if (!team) return null
  return (
    <CardThemed onClick={onClick}>
      <CardContent>
        <Box sx={{ overflowWrap: 'anywhere' }}>{JSON.stringify(team)}</Box>
      </CardContent>
    </CardThemed>
  )
}
