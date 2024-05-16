import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AddIcon from '@mui/icons-material/Add'
import {
  Button,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { TeamCard } from '../../team'
import { LoadoutEditor } from './LoadoutEditor'
import { LoadoutHeaderContent } from './LoadoutHeaderContent'
const columns = {
  xs: 1,
  md: 2,
} as const

// TODO: Translation
export function LoadoutCard({
  teamCharId,
  teamIds,
}: {
  teamCharId: string
  teamIds: string[]
}) {
  const navigate = useNavigate()
  const database = useDatabase()
  const onAddTeam = (teamCharId: string) => {
    const teamId = database.teams.new()
    database.teams.set(teamId, (team) => {
      team.loadoutData[0] = { teamCharId } as LoadoutDatum
    })
    navigate(`/teams/${teamId}`)
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
          <LoadoutHeaderContent teamCharId={teamCharId} showSetting />
        </CardActionArea>
        <Divider />
        <CardContent sx={{ p: 1 }}>
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
