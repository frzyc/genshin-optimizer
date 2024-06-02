import { CardThemed, InfoTooltip } from '@genshin-optimizer/common/ui'
import type { Team } from '@genshin-optimizer/sr/db'
import { CardContent, Grid, Typography } from '@mui/material'
import { useDatabaseContext } from '../Context'

export function TeamCard({ team }: { team: Team }) {
  const { database } = useDatabaseContext()
  return (
    <CardThemed>
      <CardContent>
        <Typography variant="h4">{team.name}</Typography>
        {team.description && <InfoTooltip title={team.description} />}
        <Grid container columns={4} gap={1}>
          {team.loadoutData.map((ld, i) =>
            ld?.teamCharId ? (
              <CardThemed key={ld.teamCharId} sx={{ flexGrow: 1 }}>
                <Typography>
                  {database.teamChars.get(ld.teamCharId)?.key}
                </Typography>
              </CardThemed>
            ) : (
              <CardThemed key={i} sx={{ flexGrow: 1 }}>
                <Typography>Empty</Typography>
              </CardThemed>
            )
          )}
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
