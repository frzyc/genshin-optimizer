import { BootstrapTooltip, TextFieldLazy } from '@genshin-optimizer/common/ui'
import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { CharIconSide, CharacterName } from '@genshin-optimizer/gi/ui'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  CardContent,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  TextField,
} from '@mui/material'
import { useState } from 'react'
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
  const [editMode, setEditMode] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const handleClickAway = () => {
    setEditMode(false);
    database.teams.set(teamId, { name: teamName, description: description })
  };
  const handleClickOn = () => {
    setEditMode(true);
  };
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
      <BootstrapTooltip
        title={
          team.description ? (
            <Typography>{team.description}</Typography>
          ) : undefined
        }
      >
      <CardContent sx={{ display: 'flex', justifyContent: 'center', pb: 0 }}>
        <Typography variant="h5" display="flex" onClick={handleClickOn}>
          {teamName}
        </Typography>
        <Dialog open={editMode} onClose={handleClickAway} maxWidth='md' fullWidth>
          <DialogTitle align="center">Edit Team</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
                <TextFieldLazy
                  label="Team Name"
                  value={teamName}
                  onChange={(teamName) => database.teams.set(teamId, { name: teamName})}
                  autoFocus
                />
                <TextFieldLazy
                  label="Description"
                  value={description}
                  onChange={(description) => database.teams.set(teamId, { description })}
                  multiline
                  minRows={4}
                />
              </Box>
            </DialogContent>
          </Dialog>
        </CardContent>
      </BootstrapTooltip>
      <Tabs
        variant="fullWidth"
        value={characterKey ?? 'team'}
        orientation={isXs ? 'vertical' : 'horizontal'}
      >
        <Tab
          icon={<GroupsIcon />}
          iconPosition="start"
          value={'team'}
          label={'Team Settings'}
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
                  `Character ${ind + 1}` // TODO: Translation
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
