import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  NextImage,
} from '@genshin-optimizer/common/ui'
import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import {
  artifactAsset,
  characterAsset,
  imgAssets,
  weaponAsset,
} from '@genshin-optimizer/gi/assets'
import type { ArtifactSetKey, CharacterKey } from '@genshin-optimizer/gi/consts'
import type {
  ArtifactData,
  ICachedArtifact,
  ICachedWeapon,
} from '@genshin-optimizer/gi/db'
import type { CharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import {
  CharacterContext,
  useCharacter,
  useDBMeta,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import {
  getCharEle,
  getCharStat,
  weaponHasRefinement,
} from '@genshin-optimizer/gi/stats'
import { ElementIcon, SlotIcon, StatIcon } from '@genshin-optimizer/gi/svgicons'
import { getLevelString } from '@genshin-optimizer/gi/util'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  Button,
  CardActionArea,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { dataContextObj } from '../../context'
import { DataContext, SillyContext } from '../../context'
import { useCharData } from '../../hooks'
import { getBuildTcArtifactData, iconAsset } from '../../util'
import { ArtifactSlotName } from '../artifact'
import { TeamDelModal } from './TeamDelModal'

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
  const [showDel, onShowDel, onHideDel] = useBoolState()

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Button
            onClick={() => onClick()}
            variant="outlined"
            fullWidth
            color="neutral300"
            sx={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <Typography
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
              }}
              variant="h6"
            >
              <span>{name}</span>
              {description && (
                <BootstrapTooltip
                  title={<Typography>{description}</Typography>}
                >
                  <InfoIcon />
                </BootstrapTooltip>
              )}
            </Typography>
          </Button>

          <TeamDelModal
            teamId={teamId}
            show={showDel}
            onHide={onHideDel}
            onDel={function (): void {}}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={onShowDel}
            color="error"
            sx={{
              borderTopLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            <DeleteForeverIcon />
          </Button>
        </Box>
        <Box
          sx={{
            marginTop: 'auto',
          }}
        >
          {loadoutData.map((loadoutDatum, i) => {
            const teamCharId = loadoutDatum?.teamCharId
            const characterKey =
              teamCharId && database.teamChars.get(teamCharId)?.key
            return (
              <Box
                className="team-teammate"
                sx={{
                  border: '1px rgba(200,200,200,0.3) solid',
                  '&:hover': {
                    border: '1px rgba(200,200,200,0.8) solid',
                  },
                }}
              >
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
                        backgroundColor: 'neutral600.main',
                      }}
                    >
                      <Box
                        component={NextImage ? NextImage : 'img'}
                        src={
                          imgAssets.team[
                            `team${i + 1}` as keyof typeof imgAssets.team
                          ]
                        }
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
              </Box>
            )
          })}
        </Box>
      </Box>
    </CardThemed>
  )
}
/*
 * This Element has very specific layering, from bottom to top:
 * banner
 * banner filter
 * character icon
 * dark gradient
 * everything else
 */
const zVals = {
  banner: 0,
  bannerFilter: 1,
  characterIcon: 2,
  darkDRop: 3,
  other: 4,
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
  const weapon = useMemo(
    () => database.teams.getLoadoutWeapon(loadoutDatum),
    [loadoutDatum, database]
  )
  const arts = (() => {
    const { buildType, buildTcId } = loadoutDatum
    if (buildType === 'tc' && buildTcId)
      return getBuildTcArtifactData(database.buildTcs.get(buildTcId)!)
    return Object.values(
      database.teams.getLoadoutArtifacts(loadoutDatum)
    ).filter((a) => a) as ICachedArtifact[]
  })()

  const artifactData = useMemo(
    () => database.teams.getLoadoutArtifactData(loadoutDatum),
    [database, loadoutDatum]
  )

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
                zIndex: zVals.banner,
              },
            }}
          >
            {/* Gradient + filter */}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: zVals.bannerFilter,
                backdropFilter: 'blur(3px)',
                background: `linear-gradient(to right, ${colorToRgbaString(
                  hexToColor(theme.palette.neutral600.main as string)!,
                  0.8
                )}, ${colorToRgbaString(
                  hexToColor(theme.palette.neutral600.main as string)!,
                  0.4
                )} 100% )`,
              })}
            />
            {/* Bottom Gradient */}
            <Box
              sx={(theme) => ({
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: zVals.darkDRop,
                // dark gradient
                background: `linear-gradient(to top, ${colorToRgbaString(
                  hexToColor(theme.palette.neutral600.main as string)!,
                  0.9
                )}, rgba(0,0,0,0) 25% )`,
              })}
            />
            {/* Left */}
            <Box
              sx={{
                height: 120,
                width: 120,
                position: 'absolute',
                zIndex: zVals.other,
              }}
            >
              {character && (
                <Typography
                  sx={{
                    position: 'absolute',
                    lineHeight: 1,
                    bottom: 0,
                    p: 0.5,
                    textShadow: '0 0 5px black',
                  }}
                >
                  {getLevelString(character.level, character.ascension)}
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
                  }}
                >
                  C{character.constellation}
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
                  }}
                >
                  <ColorText color={element}>
                    <ElementIcon ele={element} />
                  </ColorText>
                </Typography>
              )}
            </Box>

            <Box
              component={NextImage ? NextImage : 'img'}
              src={iconAsset(characterKey, gender, silly)}
              sx={{
                height: 120,
                width: 120,
                zIndex: zVals.characterIcon,
              }}
            />
            {/* Right */}
            <Box
              sx={{
                pr: 0.5,
                pl: 0.5,
                py: 0.5,
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                width: '100%',
                minWidth: 0,
                justifyContent: 'space-between',
                zIndex: zVals.other,
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
              <Box sx={{ display: 'flex', mb: 0.5, gap: 1 }}>
                <WeaponCard weapon={weapon} />
                <ArtifactCard artifactData={artifactData} />
              </Box>
            </Box>
          </Box>
        </Suspense>
      </DataContext.Provider>
    </CharacterContext.Provider>
  )
}
function WeaponCard({ weapon }: { weapon: ICachedWeapon }) {
  return (
    <CardThemed
      bgt="neutral600"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'horizontal',
        boxShadow: `0 0 10px rgba(0,0,0,0.4)`,
      }}
    >
      <Box
        component={NextImage ? NextImage : 'img'}
        src={weaponAsset(weapon.key, weapon.ascension >= 2)}
        maxWidth="100%"
        maxHeight="50px"
        sx={{ mt: 'auto' }}
      />
      <Box
        sx={{
          pr: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          color: 'neutral200.main',
        }}
      >
        <Typography sx={{}}>
          {getLevelString(weapon.level, weapon.ascension)}
        </Typography>

        {weaponHasRefinement(weapon.key) && (
          <Typography>R{weapon.refinement}</Typography>
        )}
      </Box>
    </CardThemed>
  )
}

function ArtifactCard({ artifactData }: { artifactData: ArtifactData }) {
  const { setNum = {}, mains = {} } = artifactData
  const { t } = useTranslation('statKey_gen')
  const processedSetNum = Object.entries(setNum).filter(
    ([, num]) => num === 2 || num === 4
  )
  return (
    <CardThemed
      bgt="neutral600"
      sx={{
        height: '100%',
        maxHeight: '50px',
        display: 'flex',
        flexDirection: 'horizontal',
        boxShadow: `0 0 10px rgba(0,0,0,0.4)`,
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          Width: '50px',
          minWidth: '50px',
          height: '50px',
          position: 'relative',
        }}
      >
        {processedSetNum.length === 2 ? (
          <Set22 sets={processedSetNum.map(([set]) => set)} />
        ) : processedSetNum.length === 1 ? (
          <Set4 set={processedSetNum[0][0]} num={processedSetNum[0][1]} />
        ) : (
          false
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          position: 'relative',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {Object.entries(mains)
          .filter(([, statKey]) => statKey)
          .map(([slotKey, statKey]) => {
            const slotIcon = (
              <SlotIcon
                slotKey={slotKey}
                iconProps={{ sx: { fontSize: 'inherit' } }}
              />
            )

            const statIcon = (
              <StatIcon
                statKey={statKey}
                iconProps={{ sx: { fontSize: 'inherit' } }}
              />
            )
            return (
              <BootstrapTooltip
                key={slotKey + statKey}
                title={
                  <Box>
                    <Suspense fallback={<Skeleton variant="text" />}>
                      <Typography
                        sx={{
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        {slotIcon}
                        <ArtifactSlotName slotKey={slotKey} />
                      </Typography>
                      <Typography
                        sx={{
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        {statIcon}
                        {t(statKey)}
                      </Typography>
                    </Suspense>
                  </Box>
                }
              >
                <Typography sx={{ lineHeight: 0 }}>
                  {slotIcon}
                  {statIcon}
                </Typography>
              </BootstrapTooltip>
            )
          })}
      </Box>
    </CardThemed>
  )
}
function Set22({ sets }: { sets: ArtifactSetKey[] }) {
  const set1 = sets[0]
  const set2 = sets[1]
  return (
    <>
      {/* top left */}
      <Box
        component={NextImage ? NextImage : 'img'}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          Width: '50px',
          height: '50px',
          clipPath: `polygon(0 0, 0 100%, 100% 0)`,
        }}
        src={artifactAsset(set1, 'flower')}
      />
      {/* bottom right */}
      <Box
        component={NextImage ? NextImage : 'img'}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          Width: '50px',
          height: '50px',
          clipPath: `polygon(100% 100%, 0 100%, 100% 0)`,
        }}
        src={artifactAsset(set2, 'flower')}
      />
      {/* top left 2 */}
      <Box
        className="botright"
        sx={(theme) => ({
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '1.4em',
          padding: '0.2em',
          textAlign: 'center',
          backgroundColor: colorToRgbaString(
            hexToColor(theme.palette.primary.main as string)!,
            0.4
          ),
          borderRadius: '100%',
        })}
      >
        2
      </Box>
      {/* bottom right 2 */}
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1.4em',
          padding: '0.2em',
          textAlign: 'center',
          backgroundColor: colorToRgbaString(
            hexToColor(theme.palette.primary.main as string)!,
            0.4
          ),
          borderRadius: '100%',
        })}
      >
        2
      </Box>
    </>
  )
}
function Set4({ set, num }: { set: ArtifactSetKey; num: number }) {
  return (
    <>
      <Box
        sx={(theme) => ({
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '1.4em',
          padding: '0.2em',
          textAlign: 'center',
          backgroundColor: colorToRgbaString(
            hexToColor(theme.palette.primary.main as string)!,
            0.4
          ),
          borderRadius: '100%',
        })}
      >
        {num}
      </Box>
      <Box
        component={NextImage ? NextImage : 'img'}
        src={artifactAsset(set, 'flower')}
        sx={{ Width: '50px', height: '50px' }}
      />
    </>
  )
}
