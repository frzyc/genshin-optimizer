import { CardThemed, InfoTooltip } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import {
  Box,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'

export function TeamCard({
  teamId,
  bgTheme = 'light',
  onClick,
}: {
  teamId: string
  bgTheme?: 'light' | 'dark'
  onClick: (charID?: CharacterKey) => void
}) {
  const { database } = useDatabaseContext()
  const team = database.teams.get(teamId)!
  return (
    <CardThemed
      bgt={bgTheme}
      sx={{
        height: '100%',
        border: '1px rgba(200,200,200,0.4) solid',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <CardActionArea onClick={() => onClick()} sx={{ p: 1 }}>
            <Typography
              sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
              variant="h6"
            >
              <span>{team.name}</span>{' '}
              {team.description && <InfoTooltip title={team.description} />}
            </Typography>
          </CardActionArea>
        </Box>
        <CardContent>
          <Grid container columns={4} gap={1}>
            {team.teamMetadata.map((cmdata, i) => (
              <CardThemed
                key={`${i}-${cmdata?.characterKey}`}
                sx={{ flexGrow: 1 }}
              >
                <Typography>{cmdata?.characterKey ?? 'Empty'} </Typography>
              </CardThemed>
            ))}
          </Grid>
        </CardContent>
      </Box>
    </CardThemed>
  )
}
