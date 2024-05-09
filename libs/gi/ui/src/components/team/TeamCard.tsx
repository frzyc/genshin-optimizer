import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
} from '@genshin-optimizer/common/ui'
import { characterAsset, imgAssets } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { CharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import {
  CharacterContext,
  useCharacter,
  useDBMeta,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import { getLevelString } from '@genshin-optimizer/gi/util'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  CardActionArea,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { Suspense, useContext, useMemo } from 'react'
import type { dataContextObj } from '../../context'
import { DataContext, SillyContext } from '../../context'
import { useCharData } from '../../hooks'
import { getBuildTcArtifactData, iconAsset } from '../../util'
import {
  CharacterCardEquipmentRow,
  CharacterCardEquipmentRowTC,
} from '../character'

// TODO: Translation

export function TeamCard({
  teamId,
  onClick,
  bgt,
}: {
  teamId: string
  bgt?: 'light' | 'dark'
  onClick: (cid?: CharacterKey) => void
}) {
  const team = useTeam(teamId)!
  const { name, description, loadoutData } = team
  const database = useDatabase()

  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: '100%',
        border: '1px rgba(200,200,200,0.4) solid',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardActionArea onClick={() => onClick()} sx={{ p: 1 }}>
          <Typography sx={{ display: 'flex', gap: 1 }} variant="h6">
            <span>{name}</span>{' '}
            {description && (
              <BootstrapTooltip title={<Typography>{description}</Typography>}>
                <InfoIcon />
              </BootstrapTooltip>
            )}
          </Typography>
        </CardActionArea>

        <Box sx={{ marginTop: 'auto' }}>
          {loadoutData.map((loadoutDatum, i) => {
            const teamCharId = loadoutDatum?.teamCharId
            const characterKey =
              teamCharId && database.teamChars.get(teamCharId)?.key
            return (
              <React.Fragment key={i}>
                <Divider />
                {characterKey ? (
                  <CardActionArea onClick={() => onClick(characterKey)}>
                    <CharacterArea
                      characterKey={characterKey}
                      teamId={teamId}
                      teamCharId={teamCharId}
                    />
                  </CardActionArea>
                ) : (
                  <CardActionArea
                    onClick={() => onClick()}
                    sx={{ height: 120, position: 'relative' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // py: '12.5%',
                        height: 120,
                      }}
                    >
                      <Box
                        component="img"
                        src={imgAssets.team[`team${i + 1}` as any]}
                        sx={{
                          width: 'auto',
                          my: '15px',
                          height: 90,
                          opacity: 0.7,
                          mx: 'auto',
                        }}
                      />
                    </Box>
                  </CardActionArea>
                )}
              </React.Fragment>
            )
          })}
        </Box>
      </Box>
    </CardThemed>
  )
}

function CharacterArea({
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
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const charStat = getCharStat(characterKey)

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
  const banner = characterAsset(characterKey, 'banner', gender)
  const element = getCharEle(characterKey)
  if (!characterContextObj || !dataContextObj) return null
  return (
    <CharacterContext.Provider value={characterContextObj}>
      <DataContext.Provider value={dataContextObj}>
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={300} />
          }
        >
          {/*
           * This Element has very specific layering
           * 0 banner
           * 1 character icon
           * 2 dark gradient
           * 3 everything else
           */}
          <Box
            className={!banner ? `grad-${charStat.rarity}star` : undefined}
            sx={{
              display: 'flex',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                opacity: 0.5,
                backgroundImage: `url(${banner})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                zIndex: 0,
              },
            }}
          >
            {/* Left */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: 2,
                top: 0,
                // dark gradient
                background: `linear-gradient(to top, rgba(50,50,50,0.7), rgba(0,0,0,0) 25% )`,
              }}
            />
            <Box
              sx={{
                height: 120,
                width: 120,
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={iconAsset(characterKey, gender, silly)}
                sx={{
                  height: 120,
                  width: 120,
                  zIndex: 1,
                }}
              />
              {character && (
                <Typography
                  sx={{
                    position: 'absolute',
                    lineHeight: 1,
                    bottom: 0,
                    p: 0.5,
                    textShadow: '0 0 5px black',
                    zIndex: 3,
                  }}
                >
                  <strong>
                    {getLevelString(character.level, character.ascension)}
                  </strong>
                </Typography>
              )}
              {character && (
                <Typography
                  sx={{
                    position: 'absolute',
                    lineHeight: 1,
                    bottom: 0,
                    right: 0,
                    p: 0.5,
                    textShadow: '0 0 5px black',
                    zIndex: 3,
                  }}
                >
                  <strong>C{character.constellation}</strong>
                </Typography>
              )}
              {characterKey.startsWith('Traveler') && (
                <Typography
                  sx={{
                    position: 'absolute',
                    lineHeight: 1,
                    top: 0,
                    left: 0,
                    p: 0.5,
                    textShadow: '0 0 5px black',
                    zIndex: 3,
                  }}
                >
                  <ColorText color={element}>
                    <ElementIcon ele={element} />
                  </ColorText>
                </Typography>
              )}
            </Box>
            {/* Right */}
            <Box
              sx={{
                pr: 0.5,
                py: 0.5,
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                width: '100%',
                minWidth: 0,
                justifyContent: 'space-between',
                zIndex: 3,
              }}
            >
              <Typography
                noWrap
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  textShadow: '0 0 5px black',
                }}
              >
                <PersonIcon />
                <span>{name}</span>
              </Typography>

              <Typography
                noWrap
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  textShadow: '0 0 5px black',
                }}
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
          </Box>
        </Suspense>
      </DataContext.Provider>
    </CharacterContext.Provider>
  )
}
