import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  useCharMeta,
  useCharacter,
  useDBMeta,
} from '@genshin-optimizer/gi/db-ui'
import { ascensionMaxLevel } from '@genshin-optimizer/gi/util'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material'
import type { MouseEvent, ReactNode } from 'react'
import { Suspense, useCallback, useContext, useEffect, useState } from 'react'
import { SillyContext } from '../../Context/SillyContext'
import { getCharSheet } from '../../Data/Characters'
import { ElementIcon } from '../../KeyMap/StatIcon'
import { iconAsset } from '../../Util/AssetUtil'
import BootstrapTooltip from '../BootstrapTooltip'
import CardDark from '../Card/CardDark'
import ConditionalWrapper from '../ConditionalWrapper'
import SqBadge from '../SqBadge'
import CharacterCard from './CharacterCard'

export default function CharacterCardPico({
  characterKey,
  onClick,
  onMouseDown,
  onMouseEnter,
  simpleTooltip = false,
  disableTooltip = false,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
  onMouseDown?: (e: MouseEvent) => void
  onMouseEnter?: (e: MouseEvent) => void
  simpleTooltip?: boolean
  disableTooltip?: boolean
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
  const [open, setOpen] = useState(false)
  const onTooltipOpen = useCallback(
    () => !disableTooltip && setOpen(true),
    [disableTooltip]
  )
  const onTooltipClose = useCallback(() => setOpen(false), [])
  useEffect(() => {
    disableTooltip && setOpen(false)
  }, [disableTooltip])

  const simpleTooltipWrapperFunc = useCallback(
    (children: ReactNode) => (
      <BootstrapTooltip
        placement="top"
        open={open && !disableTooltip}
        onClose={onTooltipClose}
        onOpen={onTooltipOpen}
        title={
          <Suspense fallback={<Skeleton width={300} height={400} />}>
            <Typography>
              {characterSheet.elementKey && (
                <ElementIcon
                  ele={characterSheet.elementKey}
                  iconProps={{
                    fontSize: 'inherit',
                    sx: {
                      verticalAlign: '-10%',
                      color: `${characterSheet.elementKey}.main`,
                    },
                  }}
                />
              )}{' '}
              {characterSheet.name}
            </Typography>
          </Suspense>
        }
      >
        {children as JSX.Element}
      </BootstrapTooltip>
    ),
    [
      characterSheet.elementKey,
      characterSheet.name,
      disableTooltip,
      onTooltipClose,
      onTooltipOpen,
      open,
    ]
  )
  const charCardTooltipWrapperFunc = useCallback(
    (children: ReactNode) => (
      <BootstrapTooltip
        enterNextDelay={500}
        enterTouchDelay={500}
        placement="top"
        open={open && !disableTooltip}
        onClose={onTooltipClose}
        onOpen={onTooltipOpen}
        title={
          <Box sx={{ width: 300, m: -1 }}>
            <CharacterCard hideStats characterKey={characterKey} />
          </Box>
        }
      >
        {children as JSX.Element}
      </BootstrapTooltip>
    ),
    [characterKey, disableTooltip, onTooltipClose, onTooltipOpen, open]
  )

  return (
    <ConditionalWrapper
      condition={simpleTooltip}
      wrapper={simpleTooltipWrapperFunc}
      falseWrapper={charCardTooltipWrapperFunc}
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
          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            {favorite ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </Box>
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
    </ConditionalWrapper>
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
        src={imgAssets.team[`team${index + 2}`]}
        sx={{ width: '75%', height: 'auto', opacity: 0.7 }}
      />
    </CardDark>
  )
}
