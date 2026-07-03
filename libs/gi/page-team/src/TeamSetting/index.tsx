import { AdResponsive } from '@genshin-optimizer/common/ad'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { TeamData, dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  EnemyExpandCard,
  GOAdWrapper,
  TeamDelModal,
  TeamInfoAlert,
} from '@genshin-optimizer/gi/ui'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import type { ButtonProps } from '@mui/material'
import {
  Box,
  Button,
  CardContent,
  Grid,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ResonanceDisplay } from './ResonanceDisplay'
import { TeamMembersEditor } from './TeamMembersEditor'
import TeamExportModal from './TeamExportModal'

export default function TeamSetting({
  teamId,
  teamData,
}: {
  teamId: string
  teamData?: TeamData
  buttonProps?: ButtonProps
}) {
  const { t } = useTranslation('page_team')
  const navigate = useNavigate()
  const database = useDatabase()
  const [show, onShow, onHide] = useBoolState()
  const team = database.teams.get(teamId)!
  const noChars = team.loadoutData.every((id) => !id)

  const onDelNoChars = () => {
    database.teams.remove(teamId)
    navigate(`/teams`)
  }

  const onDup = () => {
    const newTeamId = database.teams.duplicate(teamId)
    navigate(`/teams/${newTeamId}`)
  }
  const [showDel, onShowDel, onHideDel] = useBoolState()
  return (
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TeamInfoAlert />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TeamExportModal show={show} teamId={teamId} onHide={onHide} />
        <Button
          color="info"
          sx={{ flexGrow: 1 }}
          startIcon={<ContentPasteIcon />}
          disabled={noChars}
          onClick={onShow}
        >
          {t('teamSettings.exportBtn')}
        </Button>
        <Button
          color="info"
          sx={{ flexGrow: 1 }}
          disabled={noChars}
          onClick={onDup}
          startIcon={<ContentCopyIcon />}
        >
          {t('teamSettings.dupBtn')}
        </Button>
        <TeamDelModal
          teamId={teamId}
          show={showDel}
          onHide={onHideDel}
          onDel={() => navigate(`/teams`)}
        />
        <Button
          color="error"
          sx={{ flexGrow: 1 }}
          onClick={noChars ? onDelNoChars : onShowDel}
          startIcon={<DeleteForeverIcon />}
        >
          {t('teamSettings.deleteBtn')}
        </Button>
      </Box>
      <EnemyExpandCard teamId={teamId} />
      <TeamEditor teamId={teamId} teamData={teamData} />
    </CardContent>
  )
}
function TeamEditor({
  teamId,
  teamData,
}: {
  teamId: string
  teamData?: TeamData
}) {
  const database = useDatabase()
  const team = database.teams.get(teamId)!
  const { loadoutData } = team

  const firstTeamCharId = loadoutData[0]?.teamCharId
  const firstTeamCharKey =
    firstTeamCharId && database.teamChars.get(firstTeamCharId)?.key
  const charData = firstTeamCharKey && teamData?.[firstTeamCharKey]
  const charUIData = charData ? charData.target : undefined

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
      compareData: undefined,
    }
  }, [charUIData, teamData])
  return (
    <>
      <Grid container columns={{ xs: 1, md: 2 }} spacing={2}>
        <Grid item xs={1}>
          <ResonanceDisplay
            teamId={teamId}
            team={team}
            dataContextValue={dataContextValue}
          />
        </Grid>
        <Grid item xs={1}>
          <AdResponsive
            bgt="light"
            dataAdSlot="5102492054"
            maxHeight={400}
            Ad={GOAdWrapper}
          />
        </Grid>
      </Grid>
      <TeamMembersEditor teamId={teamId} teamData={teamData} />
    </>
  )
}
