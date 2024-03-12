import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { CharacterName } from '@genshin-optimizer/gi/ui'
import PersonIcon from '@mui/icons-material/Person'
import { Box, Tab, Tabs } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CharIconSide from '../Components/Image/CharIconSide'
import { getCharSheet } from '../Data/Characters'
import { hexToColor } from '@genshin-optimizer/common/util'
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

  const elementArray: Array<ElementKey | undefined> = teamCharIds.map(
    (tcid) => {
      if (!tcid) return
      const teamChar = database.teamChars.get(tcid)
      if (!teamChar) return
      return getCharSheet(teamChar.key).elementKey
    }
  )
  const selectedIndex = teamCharIds.findIndex(
    (tcid) => database.teamChars.get(tcid)?.key === characterKey
  )
  const selectedEle = elementArray[selectedIndex]
  return (
    <Box>
      <CardThemed bgt="light">
        <Tabs
          variant="fullWidth"
          value={characterKey ?? 0}
          sx={(theme) => {
            const rgbas = elementArray.map((ele, i) => {
              if (!ele) return `rgba(0,0,0,0)`

              const hex = theme.palette[ele].main as string
              const color = hexToColor(hex)
              if (!color) return `rgba(0,0,0,0)`
              return `rgba(${color.r},${color.g},${color.b},${
                selectedIndex === i ? 0.5 : 0.15
              })`
            })
            return {
              // will be in the form of `linear-gradient(to right, red 12.5%, orange 27.5%, yellow 62.5%, green 87.5%)`
              background: `linear-gradient(to right, ${rgbas
                .map((rgba, i) => `${rgba} ${i * 25 + 12.5}%`)
                .join(', ')})`,
              '& .MuiTab-root:hover': {
                transition: 'background-color 0.25s ease',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              '& .Mui-selected': {
                color: 'white !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor:
                  selectedEle && theme.palette[selectedEle]?.main,
              },
            }
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
