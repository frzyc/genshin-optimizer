import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import AddIcon from '@mui/icons-material/Add'
import { Button, CardContent, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TeamCard } from '../../team'
import { LoadoutEditor } from './LoadoutEditor'
import { LoadoutHeaderContent } from './LoadoutHeaderContent'
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
  const { t } = useTranslation('page_character')
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
        <Button
          fullWidth
          onClick={onShow}
          sx={{
            p: 0,
            display: 'flex',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          color="neutral100"
          variant="outlined"
        >
          <LoadoutHeaderContent teamCharId={teamCharId} showSetting />
        </Button>
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
                {t('charContentModal.addTeam')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </CardThemed>
    </>
  )
}
