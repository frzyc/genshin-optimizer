import {
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { TeamIcon } from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

export function TeamEditorModal({
  teamId,
  show,
  onClose,
}: {
  teamId: string
  show: boolean
  onClose: () => void
}) {
  const { t } = useTranslation('page_team')
  const database = useDatabase()
  const team = useTeam(teamId)!
  const handleName = (teamName: string): void => {
    database.teams.set(teamId, { name: teamName })
  }
  const handleDesc = (teamDesc: string): void => {
    database.teams.set(teamId, { description: teamDesc })
  }
  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title={t('team.editNameDesc')}
          avatar={<TeamIcon />}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            <TextFieldLazy
              label={t('team.name')}
              value={team.name}
              onChange={(teamName) => handleName(teamName)}
              autoFocus
            />
            <TextFieldLazy
              label={t('team.desc')}
              value={team.description}
              onChange={(teamDesc) => handleDesc(teamDesc)}
              multiline
              minRows={4}
            />
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
