import {
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { TeamCardCompact, TeamIcon } from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

export function TeamSettingsModal({
  teamId,
  teamIds,
  show,
  onClose,
  onTeamSwitch,
}: {
  teamId: string
  teamIds: string[]
  show: boolean
  onClose: () => void
  onTeamSwitch: (newTeamId: string) => void
}) {
  const { t } = useTranslation('page_optimize')
  const { t: tTeam } = useTranslation('page_team')
  const database = useDatabase()
  const team = useTeam(teamId)!

  const handleName = (teamName: string): void => {
    database.teams.set(teamId, { name: teamName })
  }
  const handleDesc = (teamDesc: string): void => {
    database.teams.set(teamId, { description: teamDesc })
  }

  const onSelectTeam = (id: string) => {
    if (id !== teamId) onTeamSwitch(id)
    onClose()
  }

  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed sx={{ maxWidth: 520, width: '100%' }}>
        <CardHeader
          title={t('teamRow.settingsTitle')}
          avatar={<TeamIcon />}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="overline" color="text.secondary">
              {t('teamRow.editTeam')}
            </Typography>
            <TextFieldLazy
              label={tTeam('team.name')}
              value={team.name}
              onChange={handleName}
              autoFocus
            />
            <TextFieldLazy
              label={tTeam('team.desc')}
              value={team.description}
              onChange={handleDesc}
              multiline
              minRows={3}
            />
          </Box>
          <Divider />
          <Box>
            <Typography variant="overline" color="text.secondary">
              {t('teamRow.switchTeam')}
            </Typography>
            <Box
              sx={{
                mt: 1,
                maxHeight: 'min(50vh, 360px)',
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              <Grid container spacing={1} columns={{ xs: 1, sm: 2 }}>
                {teamIds.map((id) => {
                  const selected = id === teamId
                  return (
                    <Grid item xs={1} key={id}>
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 1,
                          outline: selected
                            ? (theme) =>
                                `2px solid ${theme.palette.primary.main}`
                            : undefined,
                          outlineOffset: 2,
                          transition: 'outline-color 0.15s ease',
                          '&:hover': !selected
                            ? {
                                outline: (theme) =>
                                  `1px solid ${theme.palette.divider}`,
                                outlineOffset: 2,
                              }
                            : undefined,
                        }}
                      >
                        <TeamCardCompact
                          teamId={id}
                          bgt="light"
                          onClick={() => onSelectTeam(id)}
                        />
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
