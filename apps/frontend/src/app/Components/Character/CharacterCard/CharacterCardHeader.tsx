import {
  ColorText,
  ConditionalWrapper,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import type { RollColorKey } from '@genshin-optimizer/gi/ui'
import { CharacterName, SillyContext } from '@genshin-optimizer/gi/ui'
import { ascensionMaxLevel } from '@genshin-optimizer/gi/util'
import { Box, CardActionArea, Chip, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { DataContext } from '../../../Context/DataContext'
import { getCharSheet } from '../../../Data/Characters'
import { input } from '../../../Formula'
import { iconAsset } from '../../../Util/AssetUtil'

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
  const charData = getCharData(characterKey)

  const actionWrapperFunc = useCallback(
    (children) => (
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
        className={!banner ? `grad-${charData.rarity}star` : undefined}
        sx={{
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0.7,
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
}: {
  characterKey: CharacterKey
}) {
  const { gender } = useDBMeta()
  const { data } = useContext(DataContext)
  const characterEle = data.get(input.charEle).value as ElementKey
  const characterLevel = data.get(input.lvl).value
  const constellation = data.get(input.constellation).value
  const ascension = data.get(input.asc).value
  const autoBoost = data.get(input.total.autoBoost).value
  const skillBoost = data.get(input.total.skillBoost).value
  const burstBoost = data.get(input.total.burstBoost).value

  const tAuto = data.get(input.total.auto).value
  const tSkill = data.get(input.total.skill).value
  const tBurst = data.get(input.total.burst).value
  const charData = getCharData(characterKey)

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
          color={autoBoost ? 'info' : 'secondary'}
          label={<strong>{tAuto}</strong>}
        />
        <Chip
          size="small"
          color={skillBoost ? 'info' : 'secondary'}
          label={<strong>{tSkill}</strong>}
        />
        <Chip
          size="small"
          color={burstBoost ? 'info' : 'secondary'}
          label={<strong>{tBurst}</strong>}
        />
      </Box>
      <Typography variant="h6" lineHeight={1}>
        <StarsDisplay stars={charData.rarity} colored inline />
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
  const charData = getCharData(characterKey)
  const sheet = getCharSheet(characterKey, gender)
  return (
    <>
      <Chip
        label={
          <Typography variant="subtitle1">
            {<CharacterName characterKey={characterKey} gender={gender} />}
          </Typography>
        }
        size="small"
        color={sheet.elementKey}
        sx={{ opacity: 0.85 }}
      />
      <Box mt={1}>
        <Typography variant="h4">
          <SqBadge>NEW</SqBadge>
        </Typography>
      </Box>
      <Typography mt={1.5}>
        <StarsDisplay stars={charData.rarity} colored />
      </Typography>
    </>
  )
}
