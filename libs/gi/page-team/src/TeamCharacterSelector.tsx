import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { CharIconSide, CharacterName, TeamIcon } from '@genshin-optimizer/gi/ui'
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
export default function TeamCharacterSelector({
  teamId,
  characterKey,
  tab = '',
}: {
  teamId: string
  characterKey?: CharacterKey
  tab?: string
}) {
  const { t } = useTranslation('page_team')
  const navigate = useNavigate()
  const database = useDatabase()

  const { gender } = useDBMeta()
  const team = useTeam(teamId)!
  const { loadoutData } = team

  const elementArray: Array<ElementKey | undefined> = loadoutData.map(
    (loadoutDatum) => {
      if (!loadoutDatum) return
      const teamChar = database.teamChars.get(loadoutDatum.teamCharId)
      if (!teamChar) return
      return getCharEle(teamChar.key)
    }
  )
  const selectedIndex = loadoutData.findIndex(
    (loadoutDatum) =>
      loadoutDatum &&
      database.teamChars.get(loadoutDatum?.teamCharId)?.key === characterKey
  )
  const selectedEle = elementArray[selectedIndex]
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [editMode, setEditMode] = useState(false)

  const handleName = (teamName: string): void => {
    database.teams.set(teamId, { name: teamName })
  }

  const handleDesc = (teamDesc: string): void => {
    database.teams.set(teamId, { description: teamDesc })
  }

  return (
    <Box
      sx={(theme) => {
        const backrgba = colorToRgbaString(
          hexToColor(theme.palette['contentLight'].main)!,
          !characterKey ? 1 : 0.5
        )!
        const rgbas = [
          // color for team setting
          ...(isXs ? [backrgba, backrgba] : [backrgba]),
          ...elementArray.map((ele, i) => {
            if (!ele) return `rgba(0,0,0,0)`

            const hex = theme.palette[ele].main as string
            const color = hexToColor(hex)
            if (!color) return `rgba(0,0,0,0)`
            return colorToRgbaString(color, selectedIndex === i ? 0.5 : 0.15)
          }),
        ]
        const selectedRgb =
          selectedEle && hexToColor(theme.palette[selectedEle].main)
        const rgba = selectedRgb && colorToRgbaString(selectedRgb, 0.3)
        return {
          // will be in the form of `linear-gradient(to right, red xx%, orange xx%, yellow xx%, green xx%)`
          background: `linear-gradient(to ${isXs ? 'bottom' : 'right'}, ${rgbas
            .map(
              (rgba, i, arr) =>
                `${rgba} ${i * (100 / arr.length) + 50 / arr.length}%`
            )
            .join(', ')})`,
          borderBottom: `1px ${rgba ?? 'rgb(200,200,200,0.3)'} solid`,
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.25s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '& .Mui-selected': {
            color: 'white !important',
          },
          '& .MuiTabs-indicator': {
            height: '4px',
            backgroundColor:
              (selectedEle && theme.palette[selectedEle]?.main) ??
              'rgb(200,200,200,0.5)', //team settings
          },
        }
      }}
    >
      <CardActionArea onClick={() => setEditMode(true)}>
        <BootstrapTooltip
          placement="top"
          title={
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  color: 'info.light',
                  gap: 1,
                }}
              >
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
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                color: 'info.light',
              },
              gap: 1,
              textShadow: '#000 0 0 10px !important',
            }}
          >
            <TeamIcon />
            <Typography noWrap variant="h5">
              {team.name}
            </Typography>
          </CardContent>
        </BootstrapTooltip>
      </CardActionArea>
      <ModalWrapper open={editMode} onClose={() => setEditMode(false)}>
        <CardThemed>
          <CardHeader
            title={t('team.editNameDesc')}
            avatar={<TeamIcon />}
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
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
      <Divider />
      <Tabs
        variant="fullWidth"
        value={characterKey ?? 'team'}
        orientation={isXs ? 'vertical' : 'horizontal'}
      >
        <Tab
          icon={<GroupsIcon />}
          iconPosition="start"
          value={'team'}
          label={t('teamSettings.tab.team')}
          onClick={() => navigate(`/teams/${teamId}/`)}
        />
        {loadoutData.map((loadoutDatum, ind) => {
          const teamCharKey =
            loadoutDatum &&
            database.teamChars.get(loadoutDatum?.teamCharId)?.key
          return (
            <Tab
              icon={
                teamCharKey ? (
                  <CharIconSide characterKey={teamCharKey} sideMargin />
                ) : (
                  <PersonIcon />
                )
              }
              iconPosition="start"
              value={teamCharKey ?? ind}
              key={ind}
              disabled={!loadoutData[ind]}
              label={
                teamCharKey ? (
                  <CharacterName characterKey={teamCharKey} gender={gender} />
                ) : (
                  t('teamSettings.tab.char', { count: ind + 1 })
                )
              }
              onClick={() =>
                // conserve the current tab when switching to another character
                teamCharKey &&
                navigate(`/teams/${teamId}/${teamCharKey}/${tab}`)
              }
            />
          )
        })}
      </Tabs>
    </Box>
  )
}
