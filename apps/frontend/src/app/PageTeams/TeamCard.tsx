import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { hexToColor, range } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import {
  useCharacter,
  useDBMeta,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import { Box, CardActionArea, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useMemo } from 'react'
import {
  CharacterCardEquipmentRow,
  CharacterCardEquipmentRowTC,
} from '../Components/Character/CharacterCard/CharacterCardEquipmentRow'
import {
  CharacterCardHeader,
  CharacterCardHeaderContent,
} from '../Components/Character/CharacterCard/CharacterCardHeader'
import CharacterCardPico, {
  BlankCharacterCardPico,
} from '../Components/Character/CharacterCardPico'
import type { CharacterContextObj } from '../Context/CharacterContext'
import { CharacterContext } from '../Context/CharacterContext'
import type { dataContextObj } from '../Context/DataContext'
import { DataContext } from '../Context/DataContext'
import { getCharSheet } from '../Data/Characters'
import { getArtifactData } from '../PageTeam/CharacterDisplay/Tabs/TabTheorycraft/optimizeTc'
import useCharData from '../ReactHooks/useCharData'

// TODO: Translation

export default function TeamCard({
  teamId,
  onClick,
  hoverCard = false,
  bgt,
}: {
  teamId: string
  bgt?: 'light' | 'dark'
  hoverCard?: boolean
  onClick: (cid?: CharacterKey) => void
}) {
  const team = useTeam(teamId)!
  const { name, description, teamCharIds } = team
  const database = useDatabase()

  const elementArray: Array<ElementKey | undefined> = teamCharIds.map(
    (tcid) => {
      if (!tcid) return
      const teamChar = database.teamChars.get(tcid)
      if (!teamChar) return
      return getCharSheet(teamChar.key).elementKey
    }
  )
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={(theme) => {
          const rgbas = elementArray.map((ele) => {
            if (!ele) return `rgba(0,0,0,0)`

            const hex = theme.palette[ele].main as string
            const color = hexToColor(hex)
            if (!color) return `rgba(0,0,0,0)`
            return `rgba(${color.r},${color.g},${color.b},0.25)`
          })
          return {
            // will be in the form of `linear-gradient(to right, red 12.5%, orange 27.5%, yellow 62.5%, green 87.5%)`
            background: `linear-gradient(to right, ${rgbas
              .map((rgba, i) => `${rgba} ${i * 25 + 12.5}%`)
              .join(', ')})`,
          }
        }}
      >
        <CardActionArea onClick={() => onClick()} sx={{ p: 1 }}>
          <Typography sx={{ display: 'flex', gap: 1 }}>
            <span>{name}</span>{' '}
            <BootstrapTooltip title={<Typography>{description}</Typography>}>
              <InfoIcon />
            </BootstrapTooltip>
          </Typography>
        </CardActionArea>

        <Box sx={{ p: 1 }}>
          <Grid container columns={4} spacing={1}>
            {range(0, 3).map((i) => {
              const teamCharId = teamCharIds[i]
              const characterKey =
                teamCharId && database.teamChars.get(teamCharId)?.key
              return (
                <Grid key={i} item xs={1} height="100%">
                  {characterKey ? (
                    <CardActionArea onClick={() => onClick(characterKey)}>
                      <CharacterCardPico
                        characterKey={characterKey}
                        hoverChild={
                          hoverCard && (
                            <HoverCard
                              characterKey={characterKey}
                              teamCharId={teamCharId}
                            />
                          )
                        }
                      />
                    </CardActionArea>
                  ) : (
                    <CardActionArea onClick={() => onClick()}>
                      <BlankCharacterCardPico index={i} />
                    </CardActionArea>
                  )}
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </Box>
    </CardThemed>
  )
}
function HoverCard({
  characterKey,
  teamCharId,
}: {
  characterKey: CharacterKey
  teamCharId: string
}) {
  const database = useDatabase()
  const character = useCharacter(characterKey)
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)

  const { name, buildType, buildTcId } = useTeamChar(teamCharId)!
  const buildname = database.teamChars.getActiveBuildName(teamCharId)
  const weapon = (() => {
    return database.teamChars.getLoadoutWeapon(teamCharId)
  })()
  const arts = (() => {
    if (buildType === 'tc' && buildTcId)
      return getArtifactData(database.buildTcs.get(buildTcId)!)
    return Object.values(
      database.teamChars.getLoadoutArtifacts(teamCharId)
    ).filter((a) => a) as ICachedArtifact[]
  })()

  const teamData = useCharData(characterKey, undefined, arts, weapon)
  const data = teamData?.[characterKey]?.target

  const characterContextObj: CharacterContextObj | undefined = useMemo(
    () =>
      character &&
      characterSheet && {
        character,
        characterSheet,
        characterDispatch: () => {},
      },
    [character, characterSheet]
  )
  const dataContextObj: dataContextObj | undefined = useMemo(
    () =>
      data &&
      teamData && {
        data,
        teamData,
      },
    [data, teamData]
  )
  if (!characterContextObj || !dataContextObj) return null
  return (
    <CharacterContext.Provider value={characterContextObj}>
      <DataContext.Provider value={dataContextObj}>
        <Box sx={{ width: 300, m: -1 }}>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={300} />
            }
          >
            <CardThemed>
              <CharacterCardHeader characterKey={characterKey}>
                <CharacterCardHeaderContent characterKey={characterKey} />
              </CharacterCardHeader>
              <Box
                sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                <Typography
                  sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                >
                  <PersonIcon />
                  <span>{name}</span>
                </Typography>

                <Typography
                  sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                >
                  <CheckroomIcon />
                  <span>{buildname}</span>
                </Typography>
                {buildType === 'tc' && buildTcId ? (
                  <CharacterCardEquipmentRowTC weapon={weapon} />
                ) : (
                  <CharacterCardEquipmentRow />
                )}
              </Box>
            </CardThemed>
          </Suspense>
        </Box>
      </DataContext.Provider>
    </CharacterContext.Provider>
  )
}
