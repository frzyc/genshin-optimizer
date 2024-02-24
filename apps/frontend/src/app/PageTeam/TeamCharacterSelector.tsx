import { CardThemed } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import PersonIcon from '@mui/icons-material/Person'
import { Box, Tab, Tabs } from '@mui/material'
import { useMatch, useNavigate } from 'react-router-dom'
import CharIconSide from '../Components/Image/CharIconSide'
export default function TeamCharacterSelector() {
  const navigate = useNavigate()
  const database = useDatabase()

  const {
    params: { teamId, tab = 'overview', characterKey: characterKeyRaw },
  } = useMatch({ path: '/teams/:teamId/:characterKey/:tab', end: false }) ?? {
    params: { teamId: '', tab: 'overview', characterKey: '' },
  }
  const team = database.teams.get(teamId) ?? { teamCharIds: [] }
  const { teamCharIds } = team
  const { gender } = useDBMeta()

  return (
    <Box>
      <CardThemed bgt="light">
        <Tabs
          variant="fullWidth"
          value={characterKeyRaw}
          sx={{
            '& .MuiTab-root:hover': {
              transition: 'background-color 0.25s ease',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {range(0, 3).map((ind) => {
            const characterKey = database.teamChars.get(teamCharIds[ind])?.key
            return (
              <Tab
                icon={
                  characterKey ? (
                    <CharIconSide characterKey={characterKey} sideMargin />
                  ) : (
                    <PersonIcon />
                  )
                }
                iconPosition="start"
                value={characterKey ?? ind}
                key={ind}
                disabled={!teamCharIds[ind]}
                label={
                  characterKey ? (
                    <CharacterName
                      characterKey={characterKey}
                      gender={gender}
                    />
                  ) : (
                    `Character ${ind + 1}`
                  )
                }
                onClick={() =>
                  navigate(`/teams/${teamId}/${characterKey}/${tab}`)
                }
              />
            )
          })}
        </Tabs>
      </CardThemed>
    </Box>
  )
}
