import { CardThemed } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import PersonIcon from '@mui/icons-material/Person'
import { Box, Tab, Tabs } from '@mui/material'
import CharIconSide from '../Components/Image/CharIconSide'
export default function TeamCharacterSelector({
  teamId,
  currentCharIndex,
  setCurrentCharIndex,
}: {
  teamId: string
  currentCharIndex: number
  setCurrentCharIndex: (ind: number) => void
}) {
  const database = useDatabase()
  const team = database.teams.get(teamId)
  const { teamCharIds } = team
  const { gender } = useDBMeta()
  return (
    <Box>
      <CardThemed bgt="light">
        <Tabs
          variant="fullWidth"
          value={currentCharIndex}
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
                value={ind}
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
                onClick={() => setCurrentCharIndex(ind)}
              />
            )
          })}
        </Tabs>
      </CardThemed>
    </Box>
  )
}
