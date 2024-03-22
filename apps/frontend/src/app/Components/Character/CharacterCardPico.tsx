import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  ConditionalWrapper,
} from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  useCharMeta,
  useCharacter,
  useDBMeta,
} from '@genshin-optimizer/gi/db-ui'
import { SillyContext } from '@genshin-optimizer/gi/ui'
import { ascensionMaxLevel } from '@genshin-optimizer/gi/util'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, CardActionArea, Typography } from '@mui/material'
import type { MouseEvent, ReactNode } from 'react'
import { useCallback, useContext } from 'react'
import { getCharSheet } from '../../Data/Characters'
import { iconAsset } from '../../Util/AssetUtil'
import CardDark from '../Card/CardDark'
import SqBadge from '../SqBadge'

export default function CharacterCardPico({
  characterKey,
  onClick,
  onMouseDown,
  onMouseEnter,
  hoverChild,
  hideFav,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onMouseDown?: (e: MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
  hoverChild?: React.ReactNode
  hideFav?: boolean
}) {
  const character = useCharacter(characterKey)
  const { favorite } = useCharMeta(characterKey)
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const characterSheet = getCharSheet(characterKey, gender)
  const onClickHandler = useCallback(
    () => onClick?.(characterKey),
    [characterKey, onClick]
  )
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea
        onClick={onClickHandler}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler, onMouseDown, onMouseEnter]
  )
  const [open, onTooltipOpen, onTooltipClose] = useBoolState()

  return (
    <BootstrapTooltip
      enterNextDelay={500}
      enterTouchDelay={500}
      placement="top"
      open={!!hoverChild && open}
      onClose={onTooltipClose}
      onOpen={onTooltipOpen}
      title={hoverChild}
    >
      <CardDark
        sx={{
          maxWidth: 128,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ConditionalWrapper
          condition={!!onClick || !!onMouseDown || !!onMouseEnter}
          wrapper={actionWrapperFunc}
        >
          <Box display="flex" className={`grad-${characterSheet.rarity}star`}>
            <Box
              component="img"
              src={iconAsset(characterKey, gender, silly)}
              maxWidth="100%"
              maxHeight="100%"
              draggable={false}
            />
          </Box>
          {character && (
            <Typography
              sx={{
                position: 'absolute',
                fontSize: '0.75rem',
                lineHeight: 1,
                opacity: 0.85,
                pointerEvents: 'none',
                top: 0,
              }}
            >
              <strong>
                <SqBadge color="primary">
                  {character.level}/{ascensionMaxLevel[character.ascension]}
                </SqBadge>
              </strong>
            </Typography>
          )}
          {!hideFav && (
            <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
              {favorite ? (
                <FavoriteIcon fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </Box>
          )}
          {character && (
            <Typography
              sx={{
                position: 'absolute',
                fontSize: '0.75rem',
                lineHeight: 1,
                opacity: 0.85,
                pointerEvents: 'none',
                bottom: 0,
                right: 0,
              }}
            >
              <strong>
                <SqBadge color="secondary">C{character.constellation}</SqBadge>
              </strong>
            </Typography>
          )}
        </ConditionalWrapper>
      </CardDark>
    </BootstrapTooltip>
  )
}

export function BlankCharacterCardPico({ index }: { index: number }) {
  return (
    <CardDark
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: '12.5%',
      }}
    >
      <Box
        component="img"
        src={imgAssets.team[`team${index + 1}`]}
        sx={{ width: '75%', height: 'auto', opacity: 0.7 }}
      />
    </CardDark>
  )
}
