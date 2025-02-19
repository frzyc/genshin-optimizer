'use client'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  NextImage,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { catTotal } from '@genshin-optimizer/common/util'
import { characterAsset, rarityDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useCharacter } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ascensionMaxLevel } from '@genshin-optimizer/zzz/util'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ElementToggle, WengineToggle } from '../toggles'

export function CharacterSingleSelectionModal({
  show,
  onHide,
  onSelect,
}: {
  show: boolean
  onHide: () => void
  onSelect: (cKey: CharacterKey) => void
}) {
  const onClose = () => {
    onHide()
  }

  return (
    <CharacterSelectionModalBase show={show} onClose={onClose}>
      <CardContent sx={{ flex: '1', overflow: 'auto' }}>
        <Grid container spacing={1} columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}>
          {allCharacterKeys.map((characterKey) => (
            <Grid item key={characterKey} xs={1}>
              <CardThemed
                bgt="light"
                sx={() => {
                  return {
                    position: 'relative',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }
                }}
              >
                <SelectionCard
                  characterKey={characterKey}
                  onClick={() => {
                    onHide()
                    onSelect(characterKey)
                  }}
                />
              </CardThemed>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CharacterSelectionModalBase>
  )
}

type CharacterSelectionModalBaseProps = {
  show: boolean
  onClose: () => void
  children: React.ReactNode
}

function CharacterSelectionModalBase({
  show,
  onClose,
  children,
}: CharacterSelectionModalBaseProps) {
  const weaponTotals = useMemo(
    () =>
      catTotal(allSpecialityKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const wtk = getCharStat(ck).specialty
          ct[wtk].total++
          if (allCharacterKeys.includes(ck)) ct[wtk].current++
        })
      ),
    []
  )

  const attributeTotals = useMemo(
    () =>
      catTotal(allAttributeKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const attr = getCharStat(ck).attribute
          ct[attr].total++
          if (allCharacterKeys.includes(ck)) ct[attr].current++
        })
      ),
    []
  )

  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{
        sx: {
          height: '100vh',
          p: { xs: 1 },
        },
      }}
    >
      <CardThemed
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <WengineToggle
                onChange={() => {}}
                value={['attack']}
                totals={weaponTotals}
                size="small"
              />
              <ElementToggle
                onChange={() => {}}
                value={['fire']}
                totals={attributeTotals}
                size="small"
              />
            </Box>
            <IconButton sx={{ ml: 'auto' }} onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
          </Box>
        </CardContent>
        <Divider />
        {children}
      </CardThemed>
    </ModalWrapper>
  )
}

function SelectionCard({
  characterKey,
  onClick,
}: {
  characterKey: CharacterKey
  onClick: () => void
}) {
  const { t } = useTranslation(['page_characters', 'charNames_gen'])
  const character = useCharacter(characterKey)
  const { rarity } = getCharStat(characterKey)
  const { level = 1, ascension = 0, mindscape = 0 } = character ?? {}

  return (
    <CardActionArea onClick={onClick}>
      <Box
        display="flex"
        position="relative"
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
          },
        }}
        width="100%"
      >
        <Box
          flexShrink={1}
          sx={{ maxWidth: { xs: '33%', lg: '30%' } }}
          alignSelf="flex-end"
          display="flex"
          flexDirection="column"
          zIndex={1}
        >
          <Box
            component={NextImage ? NextImage : 'img'}
            src={characterAsset(characterKey, 'circle')}
            width="100%"
            height="auto"
            maxWidth={256}
            sx={{ mt: 'auto' }}
          />
        </Box>
        <Box
          flexGrow={1}
          sx={{ pr: 1, pt: 1 }}
          display="flex"
          flexDirection="column"
          zIndex={1}
          justifyContent="space-evenly"
        >
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            <SqBadge
              color={getCharStat(characterKey).attribute}
              sx={{ opacity: 0.85, textShadow: '0 0 5px gray' }}
            >
              {t(`charNames_gen:${characterKey}`)}
            </SqBadge>
          </Typography>
          {character ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ textShadow: '0 0 5px gray' }}>
                <Typography
                  variant="body2"
                  component="span"
                  whiteSpace="nowrap"
                >
                  {t('characterCard.charLevel', { level: level })}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  /{ascensionMaxLevel[ascension]}
                </Typography>
              </Box>
              <Typography variant="body2">M{mindscape}</Typography>
            </Box>
          ) : (
            <Typography component="span" variant="body2">
              <SqBadge>{t('characterEditor.new')}</SqBadge>
            </Typography>
          )}
          <ImgIcon size={1.5} src={rarityDefIcon(rarity)} />
        </Box>
      </Box>
    </CardActionArea>
  )
}
