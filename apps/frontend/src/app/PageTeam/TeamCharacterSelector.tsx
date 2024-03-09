import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import PersonIcon from '@mui/icons-material/Person'
import { Box, Tab, Tabs } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CharIconSide from '../Components/Image/CharIconSide'
export default function TeamCharacterSelector({
  teamId,
  characterKey,
  tab,
}: {
  teamId: string
  characterKey?: CharacterKey
  tab: string
}) {
  const navigate = useNavigate()
  const database = useDatabase()

  const { gender } = useDBMeta()
  const { teamCharIds } = useTeam(teamId)!
  return (
    <Box>
      <CardThemed bgt="light">
        <Tabs
          variant="fullWidth"
          value={characterKey ?? 0}
          sx={{
            '& .MuiTab-root:hover': {
              transition: 'background-color 0.25s ease',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {teamCharIds.map((teamCharId, ind) => {
            const teamCharKey = database.teamChars.get(teamCharId)?.key
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
                disabled={!teamCharIds[ind]}
                label={
                  teamCharKey ? (
                    <CharacterName characterKey={teamCharKey} gender={gender} />
                  ) : (
                    `Character ${ind + 1}` // TODO: Translation
                  )
                }
                onClick={() =>
                  navigate(`/teams/${teamId}/${teamCharKey}/${tab}`)
                }
              />
            )
          })}
        </Tabs>
      </CardThemed>
    </Box>
  )
}
