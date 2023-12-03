import type {
  ArtifactSlotKey,
  ElementKey,
  LocationKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactSlotKeys,
  type CharacterKey,
} from '@genshin-optimizer/consts'
import { characterAsset } from '@genshin-optimizer/gi-assets'
import type { Calculator } from '@genshin-optimizer/gi-formula'
import {
  artifactsData,
  charData,
  conditionalData,
  convert,
  genshinCalculatorWithEntries,
  selfTag,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi-formula'
import { ascensionMaxLevel } from '@genshin-optimizer/gi-util'
import { read } from '@genshin-optimizer/pando'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { range } from '@genshin-optimizer/util'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import {
  Box,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import type { CalcContextObj } from '../../Context/CalcContext'
import { CalcContext } from '../../Context/CalcContext'
import { SillyContext } from '../../Context/SillyContext'
import { DatabaseContext } from '../../Database/Database'
import useCharMeta from '../../Hooks/useCharMeta'
import useDBMeta from '../../Hooks/useDBMeta'
import type { ICachedArtifact } from '../../Types/artifact'
import { iconAsset } from '../../Util/AssetUtil'
import { NodeFieldDisplay } from '../FieldDisplay'

// TODO: Add all this stuff back
type CharacterCardProps = {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onClickHeader?: (characterKey: CharacterKey) => void
  onClickTeammate?: (characterKey: CharacterKey) => void
  artifactChildren?: Displayable
  weaponChildren?: Displayable
  characterChildren?: Displayable
  footer?: Displayable
  hideStats?: boolean
  isTeammateCard?: boolean
}
export default function CharacterCard({
  characterKey,
  // artifactChildren,
  // weaponChildren,
  // characterChildren,
  // onClick,
  // onClickHeader,
  // onClickTeammate,
  footer,
  hideStats = false,
  isTeammateCard = false,
}: CharacterCardProps) {
  const { database } = useContext(DatabaseContext)
  // const teamData = useTeamData(characterKey)
  // const character = useCharacter(characterKey)
  // const character: ICachedCharacter = {
  //   key: characterKey,
  //   level: 50,
  //   constellation: 3,
  //   ascension: 3,
  //   talent: {
  //     auto: 5,
  //     skill: 5,
  //     burst: 5,
  //   },
  //   hitMode: 'avgHit',
  //   conditional: {},
  //   bonusStats: {},
  //   enemyOverride: {},
  //   infusionAura: '',
  //   compareData: false,
  //   customMultiTarget: [],
  //   team: ['', '', ''],
  //   teamConditional: {},
  //   equippedArtifacts: {
  //     flower: '',
  //     plume: '',
  //     sands: '',
  //     goblet: '',
  //     circlet: '',
  //   },
  //   equippedWeapon: 'test',
  // }
  // const { gender } = useDBMeta()
  // const characterSheet = getCharSheet(characterKey, gender)
  // const characterDispatch = useCharacterReducer(characterKey)
  // const data = teamData?.[characterKey]?.target
  // const onClickHandler = useCallback(
  //   () => characterKey && onClick?.(characterKey),
  //   [characterKey, onClick]
  // )
  // const actionWrapperFunc = useCallback(
  //   (children) => (
  //     <CardActionArea
  //       onClick={onClickHandler}
  //       sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
  //     >
  //       {children}
  //     </CardActionArea>
  //   ),
  //   [onClickHandler]
  // )

  // const characterContextObj: CharacterContextObj | undefined = useMemo(
  //   () =>
  //     character &&
  //     characterSheet && {
  //       character,
  //       characterSheet,
  //       characterDispatch,
  //     },
  //   [character, characterSheet, characterDispatch]
  // )
  // const dataContextObj: dataContextObj | undefined = useMemo(
  //   () =>
  //     data &&
  //     teamData && {
  //       data,
  //       teamData,
  //     },
  //   [data, teamData]
  // )

  const { favorite } = useCharMeta(characterKey)

  const [calc, setCalc] = useState<Calculator | undefined>(
    genshinCalculatorWithEntries([
      ...teamData(['member0'], ['member0']),
      ...withMember(
        'member0',
        ...charData({
          key: characterKey,
          level: 50,
          ascension: 3,
          constellation: 3,
          talent: {
            auto: 1,
            skill: 1,
            burst: 1,
          },
        }),
        ...weaponData({
          key: 'KeyOfKhajNisut',
          level: 50,
          ascension: 3,
          refinement: 1,
          location: characterKey as LocationKey,
          lock: false,
        }),
        ...artifactsData([
          // per art stat
        ]),
        ...conditionalData({
          KeyOfKhajNisut: {
            afterSkillStacks: 1,
          },
        })
      ),
    ])
  )
  useEffect(
    () =>
      setCalc(
        genshinCalculatorWithEntries([
          ...teamData(['member0'], ['member0']),
          ...withMember(
            'member0',
            ...charData({
              key: characterKey,
              level: 50,
              ascension: 3,
              constellation: 3,
              talent: {
                auto: 1,
                skill: 1,
                burst: 1,
              },
            }),
            ...weaponData({
              key: 'KeyOfKhajNisut',
              level: 50,
              ascension: 3,
              refinement: 1,
              location: characterKey as LocationKey,
              lock: false,
            }),
            ...artifactsData([
              // per art stat
            ]),
            ...conditionalData({
              KeyOfKhajNisut: {
                afterSkillStacks: 1,
              },
            })
          ),
        ])
      ),
    [characterKey]
  )
  const calcContextObj = useMemo(
    () => ({
      calc,
      setCalc,
    }),
    [calc, setCalc]
  )

  return (
    <Suspense
      fallback={
        <Skeleton
          variant="rectangular"
          width="100%"
          height={hideStats ? 300 : 600}
        />
      }
    >
      <CardThemed
        bgt="light"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            display: 'flex',
            position: 'absolute',
            zIndex: 2,
            opacity: 0.7,
          }}
        >
          <IconButton
            sx={{ p: 0.5 }}
            onClick={(_) =>
              database.charMeta.set(characterKey, { favorite: !favorite })
            }
          >
            {favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        {/* <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character && dataContextObj && characterContextObj ? ( */}
        <ExistingCharacterCardContent
          // characterContextObj={characterContextObj}
          // dataContextObj={dataContextObj}
          calcContextObj={calcContextObj}
          characterKey={characterKey}
          // onClick={onClick}
          // onClickHeader={onClickHeader}
          isTeammateCard={isTeammateCard}
          // character={character}
          // onClickTeammate={onClickTeammate}
          hideStats={hideStats}
          // weaponChildren={weaponChildren}
          // artifactChildren={artifactChildren}
          // characterChildren={characterChildren}
        />
        {/* ) : (
            <NewCharacterCardContent characterKey={characterKey} />
          )} */}
        {/* </ConditionalWrapper> */}
        {footer}
      </CardThemed>
    </Suspense>
  )
}

type ExistingCharacterCardContentProps = {
  // characterContextObj: CharacterContextObj
  // dataContextObj: dataContextObj
  calcContextObj: CalcContextObj
  characterKey: CharacterKey
  // onClick?: (characterKey: CharacterKey) => void
  // onClickHeader?: (characterKey: CharacterKey) => void
  isTeammateCard?: boolean
  // character: ICachedCharacter
  // onClickTeammate?: (characterKey: CharacterKey) => void
  hideStats?: boolean
  weaponChildren?: Displayable
  artifactChildren?: Displayable
  characterChildren?: Displayable
}
function ExistingCharacterCardContent({
  // characterContextObj,
  // dataContextObj,
  calcContextObj,
  characterKey,
  // onClick,
  // onClickHeader,
  isTeammateCard,
  // character,
  // onClickTeammate,
  hideStats,
  weaponChildren,
  artifactChildren,
  characterChildren,
}: ExistingCharacterCardContentProps) {
  return (
    // <CharacterContext.Provider value={characterContextObj}>
    //   <DataContext.Provider value={dataContextObj}>
    <CalcContext.Provider value={calcContextObj}>
      <Header
        characterKey={characterKey}
        // onClick={!onClick ? onClickHeader : undefined}
      >
        <HeaderContent />
      </Header>
      <CardContent
        sx={(theme) => ({
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          padding: hideStats ? `${theme.spacing(1)}!important` : undefined,
        })}
      >
        <Artifacts />
        {!isTeammateCard && (
          <Grid container columns={4} spacing={0.75}>
            <Grid item xs={1} height="100%">
              {/* <WeaponCardPico weaponId={character.equippedWeapon} /> */}
            </Grid>
            {range(0, 2).map((i) => (
              <Grid key={i} item xs={1} height="100%">
                {/* {character.team[i] ? (
                  <CharacterCardPico
                    simpleTooltip={hideStats}
                    characterKey={character.team[i] as CharacterKey}
                    onClick={!onClick ? onClickTeammate : undefined}
                  />
                ) : (
                  <BlankCharacterCardPico index={i} />
                )} */}
              </Grid>
            ))}
          </Grid>
        )}
        {/* {isTeammateCard && (
          <WeaponFullCard weaponId={character.equippedWeapon} />
        )} */}
        <TempWeaponCard />
        {!isTeammateCard && !hideStats && <Stats />}
        {weaponChildren}
        {artifactChildren}
        {characterChildren}
      </CardContent>
    </CalcContext.Provider>
    //   </DataContext.Provider>
    // </CharacterContext.Provider>
  )
}

// function NewCharacterCardContent({
//   characterKey,
// }: {
//   characterKey: CharacterKey
// }) {
//   return (
//     <>
//       <Header characterKey={characterKey}>
//         <HeaderContentNew characterKey={characterKey} />
//       </Header>
//       <CardContent
//         sx={{
//           width: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 1,
//           flexGrow: 1,
//           height: '100%',
//         }}
//       ></CardContent>
//     </>
//   )
// }

function Header({
  children,
  characterKey,
}: // onClick,
{
  children: JSX.Element
  characterKey: CharacterKey
  // onClick?: (characterKey: CharacterKey) => void
}) {
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  // const characterSheet = getCharSheet(characterKey, gender)

  // const actionWrapperFunc = useCallback(
  //   (children) => (
  //     <CardActionArea
  //       onClick={() => characterKey && onClick?.(characterKey)}
  //       sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
  //     >
  //       {children}
  //     </CardActionArea>
  //   ),
  //   [onClick, characterKey]
  // )
  // if (!characterSheet) return null
  return (
    // <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
    <Box
      display="flex"
      position="relative"
      // className={`grad-${characterSheet.rarity}star`}
      sx={{
        '&::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          opacity: 0.5,
          backgroundImage: `url(${characterAsset(
            characterKey,
            'banner',
            gender
          )})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        },
      }}
      width="100%"
    >
      <Box
        flexShrink={1}
        component="img"
        src={iconAsset(characterKey, gender, silly)}
        sx={{ maxWidth: '40%' }}
        alignSelf="flex-end"
        display="flex"
        flexDirection="column"
        zIndex={1}
      />
      <Box
        flexGrow={1}
        sx={{ py: 1, pr: 1 }}
        display="flex"
        flexDirection="column"
        zIndex={1}
        justifyContent="space-between"
      >
        {children}
      </Box>
    </Box>
    // </ConditionalWrapper>
  )
}

function HeaderContent() {
  // const { characterSheet } = useContext(CharacterContext)
  // const { data } = useContext(DataContext)
  const { calc } = useContext(CalcContext)
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  if (!calc) return null

  const characterEle = calc.compute(member0.char.ele)
    .val as unknown as ElementKey
  const characterLevel = calc.compute(member0.char.lvl).val
  const constellation = calc.compute(member0.char.constellation).val
  const ascension = calc.compute(member0.char.ascension).val
  // const autoBoost =
  // const skillBoost =
  // const burstBoost =

  const tAuto = calc.compute(member0.char.auto).val
  const tSkill = calc.compute(member0.char.skill).val
  const tBurst = calc.compute(member0.char.burst).val

  return (
    <>
      <Chip
        label={<Typography variant="subtitle1">todo</Typography>}
        size="small"
        color={characterEle}
        sx={{ opacity: 0.85 }}
      />
      <Box
        display="flex"
        gap={1}
        sx={{ textShadow: '0 0 5px gray' }}
        alignItems="center"
      >
        <Box>
          <Typography component="span" variant="h6" whiteSpace="nowrap">
            Lv. {characterLevel}
          </Typography>
          <Typography component="span" variant="h6" color="text.secondary">
            /{ascensionMaxLevel[ascension]}
          </Typography>
        </Box>
        <Typography component="span" whiteSpace="nowrap" sx={{ opacity: 0.85 }}>
          {/* <SqBadge
            color={
              `roll${constellation < 3 ? 3 : constellation}` as RollColorKey
            }
          >
            <ColorText color="white"> */}
          <strong>C{constellation}</strong>
          {/* </ColorText>
          </SqBadge> */}
        </Typography>
      </Box>
      <Box display="flex" gap={1} sx={{ opacity: 0.85 }}>
        <Chip
          size="small"
          // color={autoBoost ? 'info' : 'secondary'}
          label={<strong>{tAuto}</strong>}
        />
        <Chip
          size="small"
          // color={skillBoost ? 'info' : 'secondary'}
          label={<strong>{tSkill}</strong>}
        />
        <Chip
          size="small"
          // color={burstBoost ? 'info' : 'secondary'}
          label={<strong>{tBurst}</strong>}
        />
      </Box>
      <Typography variant="h6" lineHeight={1}>
        {/* <StarsDisplay stars={characterSheet.rarity} colored inline /> */}
      </Typography>
    </>
  )
}

// function HeaderContentNew({ characterKey }: { characterKey: CharacterKey }) {
//   // const { gender } = useDBMeta()
//   // const sheet = getCharSheet(characterKey, gender)

//   // if (!sheet) return null
//   return (
//     <>
//       <Chip
//         label={<Typography variant="subtitle1">{characterKey}</Typography>}
//         size="small"
//         // color={sheet.elementKey}
//         sx={{ opacity: 0.85 }}
//       />
//       <Box mt={1}>
//         <Typography variant="h4">{/* <SqBadge>NEW</SqBadge> */}</Typography>
//       </Box>
//       <Typography mt={1.5}>
//         {/* <StarsDisplay stars={sheet.rarity} colored /> */}
//       </Typography>
//     </>
//   )
// }

function Artifacts() {
  // const { database } = useContext(DatabaseContext)
  // const { data } = useContext(DataContext)
  const artifacts = useMemo(
    () =>
      allArtifactSlotKeys.map((k) => [
        k,
        // database.arts.get(''),
        undefined,
      ]),
    []
  ) as Array<[ArtifactSlotKey, ICachedArtifact | undefined]>

  return (
    <Grid direction="row" container spacing={0.75} columns={5}>
      {artifacts.map(
        ([key, _art]: [ArtifactSlotKey, ICachedArtifact | undefined]) => (
          <Grid item key={key} xs={1}>
            {/* <ArtifactCardPico artifactObj={art} slotKey={key} /> */}
          </Grid>
        )
      )}
    </Grid>
  )
}

function Stats() {
  const { calc } = useContext(CalcContext)
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  if (!calc) return null
  return (
    <Box sx={{ width: '100%' }}>
      {Object.keys(selfTag.base).map((key) => (
        <NodeFieldDisplay
          key={key}
          calcResult={calc.compute(member0.base[key])}
        />
      ))}
    </Box>
  )
}

function TempWeaponCard() {
  const { calc } = useContext(CalcContext)
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  if (!calc) return null
  return (
    <Box>
      Weapon stats:
      {Object.keys(selfTag.weapon).map((key) => (
        <NodeFieldDisplay
          key={key}
          calcResult={calc.compute(member0.weapon[key])}
        />
      ))}
      {'atk: '}
      {
        calc.compute(
          read(
            {
              member: 'member0',
              src: 'KeyOfKhajNisut',
              qt: 'base',
              q: 'atk',
              et: 'self',
            },
            'sum'
          )
        ).val
      }
    </Box>
  )
}
