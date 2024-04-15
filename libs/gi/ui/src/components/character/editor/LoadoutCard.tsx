import { useBoolState } from '@genshin-optimizer/common/react-util'
import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AddIcon from '@mui/icons-material/Add'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { TeamCard } from '../../team'
import { LoadoutEditor } from './LoadoutEditor'
const columns = {
  xs: 1,
  md: 2,
} as const

export function LoadoutCard({
  teamCharId,
  teamIds,
}: {
  teamCharId: string
  teamIds: string[]
}) {
  const navigate = useNavigate()
  const database = useDatabase()
  const { name, description } = database.teamChars.get(teamCharId)!

  const onAddTeam = (teamCharId: string) => {
    const teamId = database.teams.new()
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId } as LoadoutDatum
    })
    navigate(`/teams/${teamId}`, { state: { openSetting: true } })
  }
  const [show, onShow, onHide] = useBoolState()
  return (
    <>
      <LoadoutEditor
        show={show}
        onHide={onHide}
        teamCharId={teamCharId}
        teamIds={teamIds}
      />
      <CardThemed key={teamCharId} bgt="light">
        <CardActionArea onClick={onShow}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <PersonIcon />
              <Typography>{name}</Typography>
              {!!description && (
                <BootstrapTooltip
                  title={<Typography>{description}</Typography>}
                >
                  <InfoIcon />
                </BootstrapTooltip>
              )}

              <SettingsIcon sx={{ ml: 'auto' }} />
            </Box>
          </CardContent>
        </CardActionArea>
        <Divider />
        <CardContent>
          <Grid container columns={columns} spacing={1}>
            {teamIds.map((teamId) => (
              <Grid item xs={1} key={teamId}>
                <TeamCard
                  teamId={teamId}
                  onClick={(cid) =>
                    navigate(`/teams/${teamId}${cid ? `/${cid}` : ''}`)
                  }
                />
              </Grid>
            ))}
            <Grid item xs={1}>
              <Button
                fullWidth
                sx={{ height: '100%', backgroundColor: 'contentNormal.main' }}
                variant="outlined"
                onClick={() => onAddTeam(teamCharId)}
                color="info"
                startIcon={<AddIcon />}
              >
                Add new Team
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </CardThemed>
    </>
  )
}
