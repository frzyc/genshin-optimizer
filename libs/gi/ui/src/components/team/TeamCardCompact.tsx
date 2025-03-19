import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { hexToColor } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { CharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import {
  CharacterContext,
  useCharacter,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import { Box, CardActionArea, Grid, Skeleton, Typography } from '@mui/material'
import { Suspense, useMemo } from 'react'
import type { dataContextObj } from '../../context'
import { DataContext } from '../../context'
import { useCharData } from '../../hooks'
import { getBuildTcArtifactData } from '../../util'
import {
  BlankCharacterCardPico,
  CharacterCardEquipmentRow,
  CharacterCardEquipmentRowTC,
  CharacterCardHeader,
  CharacterCardHeaderContent,
  CharacterCardPico,
} from '../character'

export function TeamCardCompact({
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
  const { name, description, loadoutData } = team
  const database = useDatabase()

  const elementArray: Array<ElementKey | undefined> = loadoutData.map(
    (loadoutDatum) => {
      if (!loadoutDatum) return
      const teamChar = database.teamChars.get(loadoutDatum.teamCharId)
      if (!teamChar) return
      return getCharEle(teamChar.key)
    }
  )
  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: '100%',
      }}
    >
      <Box
        sx={(theme) => {
          const rgbas = elementArray.map((ele) => {
            if (!ele) return 'rgba(0,0,0,0)'

            const hex = theme.palette[ele].main as string
            const color = hexToColor(hex)
            if (!color) return 'rgba(0,0,0,0)'
            return `rgba(${color.r},${color.g},${color.b},0.25)`
          })
          return {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
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
            {description && (
              <BootstrapTooltip title={<Typography>{description}</Typography>}>
                <InfoIcon />
              </BootstrapTooltip>
            )}
          </Typography>
        </CardActionArea>

        <Box sx={{ p: 1, marginTop: 'auto' }}>
          <Grid container columns={4} spacing={1}>
            {loadoutData.map((loadoutDatum, i) => {
              const teamCharId = loadoutDatum?.teamCharId
              const characterKey =
                teamCharId && database.teamChars.get(teamCharId)?.key
              return (
                <Grid key={loadoutDatum?.teamCharId} item xs={1} height="100%">
                  {characterKey ? (
                    <CardActionArea onClick={() => onClick(characterKey)}>
                      <CharacterCardPico
                        characterKey={characterKey}
                        hoverChild={
                          hoverCard && (
                            <HoverCard
                              characterKey={characterKey}
                              teamCharId={teamCharId}
                              teamId={teamId}
                            />
                          )
                        }
                        hideFav
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
  teamId,
  teamCharId,
}: {
  characterKey: CharacterKey
  teamId: string
  teamCharId: string
}) {
  const database = useDatabase()
  const character = useCharacter(characterKey)

  const { name } = useTeamChar(teamCharId)!
  const loadoutDatum = database.teams.getLoadoutDatum(teamId, teamCharId)!
  const buildname = database.teams.getActiveBuildName(loadoutDatum)
  const weapon = (() => {
    return database.teams.getLoadoutWeapon(loadoutDatum)
  })()
  const arts = (() => {
    const { buildType, buildTcId } = loadoutDatum
    if (buildType === 'tc' && buildTcId)
      return getBuildTcArtifactData(database.buildTcs.get(buildTcId)!)
    return Object.values(
      database.teams.getLoadoutArtifacts(loadoutDatum)
    ).filter((a) => a) as ICachedArtifact[]
  })()

  const teamData = useCharData(characterKey, undefined, arts, weapon)
  const data = teamData?.[characterKey]?.target

  const characterContextObj: CharacterContextObj | undefined = useMemo(
    () =>
      character && {
        character,
      },
    [character]
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
                {loadoutDatum?.buildType === 'tc' && loadoutDatum?.buildTcId ? (
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
