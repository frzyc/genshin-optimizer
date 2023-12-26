import type {
  ArtifactSlotKey,
  ElementKey,
  GenderKey,
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
import {
  CardThemed,
  ColorText,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/ui-common'
import { getRandBool, objKeyMap } from '@genshin-optimizer/util'
import { Favorite, FavoriteBorder } from '@mui/icons-material'
import {
  Box,
  Chip,
  Grid,
  IconButton,
  Skeleton,
  Typography
} from '@mui/material'
import { Suspense, useContext, useMemo, useState } from 'react'

import { CalcContext, NodeFieldDisplay } from '@genshin-optimizer/gi-formula-ui'
import type { Character } from '@genshin-optimizer/gi-frontend-gql'
import { getCharData } from '@genshin-optimizer/gi-stats'
import type { RollColorKey } from '@genshin-optimizer/gi-ui'
import { CharacterName } from '@genshin-optimizer/gi-ui'
import Image from 'next/image'
import { ArtifactCardPico, ArtifactCardPicoBlank } from './Artifact'
import { GenshinUserContext } from './GenshinUserDataWrapper'
import { SillyContext } from './SillyContext'
import { WeaponCardPico } from './Weapon'
import { assetWrapper, iconAsset } from './util'

export function CharacterCard({ character }: { character: Character }) {
  const favorite = getRandBool() //TODO:
  const { key: characterKey } = character
  const { artifacts, weapons } = useContext(GenshinUserContext)
  const equippedArtifacts = useMemo(
    () =>
      objKeyMap(allArtifactSlotKeys, (slot) =>
        artifacts?.find(
          ({ slotKey, location }) =>
            location === characterKey && slotKey === slot
        )
      ),
    [characterKey, artifacts]
  )
  const equippedWeapon = useMemo(
    () => weapons?.find(({ location }) => location === characterKey),
    [characterKey, weapons]
  )

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
  const calcContextObj = useMemo(
    () => ({
      calc,
      setCalc,
    }),
    [calc, setCalc]
  )

  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={600} />}
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
            onClick={
              (_) => {} //TODO: database.charMeta.set(characterKey, { favorite: !favorite })
            }
          >
            {favorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>
        <CalcContext.Provider value={calcContextObj}>
          <Header characterKey={characterKey}>
            <HeaderContent characterKey={characterKey} />
          </Header>
          <Box
            sx={{
              p: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flexGrow: 1,
            }}
          >
            <Grid container columns={3} spacing={1}>
              <Grid item xs={1}>
                {!!equippedWeapon && <WeaponCardPico weapon={equippedWeapon} />}
              </Grid>
              {Object.entries(equippedArtifacts).map(([slot, art]) => (
                <Grid item xs={1} key={slot}>
                  {art ? (
                    <ArtifactCardPico artifact={art} />
                  ) : (
                    <ArtifactCardPicoBlank slotKey={slot as ArtifactSlotKey} />
                  )}
                </Grid>
              ))}
            </Grid>
            <TempWeaponCard />
            <Stats />
          </Box>
        </CalcContext.Provider>
      </CardThemed>
    </Suspense>
  )
}

function Header({
  children,
  characterKey,
}: // onClick,
{
  children: JSX.Element
  characterKey: CharacterKey
  // onClick?: (characterKey: CharacterKey) => void
}) {
  const gender: GenderKey = 'F' //TODO:
  const { silly } = useContext(SillyContext)
  const rarity = getCharData(characterKey).rarity

  return (
    <Box
      display="flex"
      position="relative"
      className={`grad-${rarity}star`}
      width="100%"
      zIndex={0}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          zIndex: -1,
        }}
      >
        <Image
          src={assetWrapper(characterAsset(characterKey, 'banner', gender))}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt="" //TODO:
          style={{
            objectFit: 'cover',
            objectPosition: 'right',
          }}
        />
      </Box>
      <Image
        src={assetWrapper(iconAsset(characterKey, gender, silly))}
        alt="" // TODO:
        style={{
          maxWidth: '40%',
          height: 'auto',
        }}
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
  )
}

function HeaderContent({ characterKey }: { characterKey: CharacterKey }) {
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

  const rarity = getCharData(characterKey).rarity

  const gender: GenderKey = 'F' //TODO:
  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">
            <CharacterName characterKey={characterKey} gender={gender} />
          </Typography>
        }
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
          <SqBadge
            color={
              `roll${constellation < 3 ? 3 : constellation}` as RollColorKey
            }
          >
            <ColorText color="white">
              <strong>C{constellation}</strong>
            </ColorText>
          </SqBadge>
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
        <StarsDisplay stars={rarity} colored inline />
      </Typography>
    </>
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
          calcResult={calc.compute((member0.base as any)[key as any] as any)}
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
          calcResult={calc.compute((member0.weapon as any)[key as any] as any)}
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
