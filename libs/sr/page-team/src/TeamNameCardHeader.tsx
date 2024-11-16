import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import CloseIcon from '@mui/icons-material/Close'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TeamSelectors from './TeamSelectors'
import { useTeamContext } from './context'
export default function TeamNameCardHeader() {
  const { t } = useTranslation('page_team')
  const { teamId, team } = useTeamContext()
  const { database } = useDatabaseContext()
  const [editMode, setEditMode] = useState(false)

  const handleName = (teamName: string): void => {
    database.teams.set(teamId, { name: teamName })
  }

  const handleDesc = (teamDesc: string): void => {
    database.teams.set(teamId, { description: teamDesc })
  }
  return (
    <>
      <CardActionArea onClick={() => setEditMode(true)}>
        <BootstrapTooltip
          placement="top"
          title={
            <Box>
              <Box sx={{ display: 'flex', color: 'info.light', gap: 1 }}>
                <BorderColorIcon />
                <Typography>
                  <strong>{t('team.editNameDesc')}</strong>
                </Typography>
              </Box>
              {!!team.description && (
                <Typography>{team.description}</Typography>
              )}
            </Box>
          }
        >
          <CardContent
            sx={{
              display: 'flex',
              justifyContent: 'center',
              '&:hover': {
                color: 'info.light',
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: '#000 0 0 10px !important',
              }}
            >
              <GroupsIcon />
              {team.name}
            </Typography>
          </CardContent>
        </BootstrapTooltip>
      </CardActionArea>
      <ModalWrapper open={editMode} onClose={() => setEditMode(false)}>
        <CardThemed>
          <CardHeader
            title={t('team.editNameDesc')}
            avatar={<GroupsIcon />}
            titleTypographyProps={{ variant: 'h6' }}
            action={
              <IconButton onClick={() => setEditMode(false)}>
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
              <TeamSelectors teamId={teamId} />
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
