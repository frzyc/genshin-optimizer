import {
  ConditionalWrapper,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type {
  AscensionKey,
  CharacterKey,
  ElementKey,
} from '@genshin-optimizer/gi/consts'
import { getCharMaxLevel } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { input } from '@genshin-optimizer/gi/wr'
import { Box, CardActionArea, Chip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useCallback, useContext } from 'react'
import { DataContext, SillyContext } from '../../../context'
import { iconAsset } from '../../../util/iconAsset'
import type { RollColorKey } from '../../artifact'
import { CharacterName } from '../Trans'

export function CharacterCardHeader({
  children,
  characterKey,
  onClick,
}: {
  children: React.ReactNode
  characterKey: CharacterKey
  onClick?: () => void
}) {
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const charStat = getCharStat(characterKey)

  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea
        onClick={onClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClick]
  )
  const banner = characterAsset(characterKey, 'banner', gender)

  return (
    <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
      <Box
        display="flex"
        position="relative"
        className={!banner ? `grad-${charStat.rarity}star` : undefined}
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
            backgroundImage: `url(${banner})`,
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
    </ConditionalWrapper>
  )
}

export function CharacterCardHeaderContent({
  characterKey,
  tcOverride = false,
}: {
  characterKey: CharacterKey
  tcOverride?: boolean
}) {
  const { gender } = useDBMeta()
  const { data } = useContext(DataContext)
  const characterEle = data.get(input.charEle).value as ElementKey
  const characterLevel = data.get(input.lvl).value
  const constellation = data.get(input.constellation).value
  const ascension = data.get(input.asc).value as AscensionKey
  const autoBoost = data.get(input.total.autoBoost).value
  const skillBoost = data.get(input.total.skillBoost).value
  const burstBoost = data.get(input.total.burstBoost).value

  const tAuto = data.get(input.total.auto).value
  const tSkill = data.get(input.total.skill).value
  const tBurst = data.get(input.total.burst).value
  const charStat = getCharStat(characterKey)

  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">
            {<CharacterName characterKey={characterKey} gender={gender} />}
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
          <Typography
            component="span"
            variant="h6"
            whiteSpace="nowrap"
            color={tcOverride ? 'yellow ' : undefined}
          >
            Lv. {characterLevel}
          </Typography>
          <Typography
            component="span"
            variant="h6"
            color={tcOverride ? 'yellow ' : 'text.secondary'}
          >
            /{getCharMaxLevel(characterLevel, ascension)}
          </Typography>
        </Box>
        <Typography
          component="span"
          whiteSpace="nowrap"
          sx={{
            opacity: 0.85,
          }}
        >
          <SqBadge
            color={
              `roll${constellation < 3 ? 3 : constellation}` as RollColorKey
            }
            sx={{ color: tcOverride ? 'yellow ' : '#FFF' }}
          >
            <strong>C{constellation}</strong>
          </SqBadge>
        </Typography>
      </Box>
      <Box
        display="flex"
        gap={1}
        sx={{
          opacity: 0.85,
        }}
      >
        <Chip
          size="small"
          sx={{ color: tcOverride ? 'yellow ' : undefined }}
          color={autoBoost ? 'info' : 'secondary'}
          label={<strong>{tAuto}</strong>}
        />
        <Chip
          size="small"
          sx={{ color: tcOverride ? 'yellow ' : undefined }}
          color={skillBoost ? 'info' : 'secondary'}
          label={<strong>{tSkill}</strong>}
        />
        <Chip
          size="small"
          sx={{ color: tcOverride ? 'yellow ' : undefined }}
          color={burstBoost ? 'info' : 'secondary'}
          label={<strong>{tBurst}</strong>}
        />
      </Box>
      <Typography variant="h6" lineHeight={1}>
        <StarsDisplay stars={charStat.rarity} colored inline />
      </Typography>
    </>
  )
}

export function HeaderContentNew({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { gender } = useDBMeta()
  const charStat = getCharStat(characterKey)
  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">
            {<CharacterName characterKey={characterKey} gender={gender} />}
          </Typography>
        }
        size="small"
        color={getCharEle(characterKey)}
        sx={{ opacity: 0.85 }}
      />
      <Box mt={1}>
        <Typography variant="h4">
          <SqBadge>NEW</SqBadge>
        </Typography>
      </Box>
      <Typography mt={1.5}>
        <StarsDisplay stars={charStat.rarity} colored />
      </Typography>
    </>
  )
}
