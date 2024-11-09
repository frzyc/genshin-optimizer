import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { useDatabaseContext, useTeam } from '@genshin-optimizer/sr/db-ui'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import CloseIcon from '@mui/icons-material/Close'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import TeamSelectors from './TeamSelectors'

export function TeamCharacterSelector({
  teamId,
  charKey,
}: {
  teamId: string
  charKey?: CharacterKey | undefined
}) {
  const { t } = useTranslation('page_team')
  const navigate = useNavigate()
  const { database } = useDatabaseContext()

  const team = useTeam(teamId)!

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [editMode, setEditMode] = useState(false)

  const handleName = (teamName: string): void => {
    database.teams.set(teamId, { name: teamName })
  }

  const handleDesc = (teamDesc: string): void => {
    database.teams.set(teamId, { description: teamDesc })
  }

  return (
    <Box
      sx={() => {
        return {
          borderBottom: '1px rgb(200,200,200,0.3) solid',
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.25s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '& .Mui-selected': {
            color: 'white !important',
          },
          '& .MuiTabs-indicator': {
            height: '4px',
            backgroundColor: 'rgb(200,200,200,0.5)', //team settings
          },
        }
      }}
    >
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
      <Divider />
      <Tabs
        variant="fullWidth"
        value={charKey ?? 0}
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        {team.teamMetadata.map((teammateDatum, ind) => {
          const characterKey = teammateDatum?.characterKey
          return (
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              value={characterKey ?? ind}
              key={ind}
              disabled={!teammateDatum}
              label={
                characterKey ? (
                  <Typography>{t(`charNames_gen:${characterKey}`)}</Typography>
                ) : (
                  `Character ${ind + 1}` // TODO: Translation
                )
              }
              onClick={() =>
                // conserve the current tab when switching to another character
                characterKey && navigate(`/teams/${teamId}/${characterKey}`)
              }
            />
          )
        })}
      </Tabs>
    </Box>
  )
}
