import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  SortByButton,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import {
  catTotal,
  filterFunction,
  sortFunction,
} from '@genshin-optimizer/common/util'
import { characterAsset, rarityDefIcon } from '@genshin-optimizer/zzz/assets'
import type {
  AttributeKey,
  CharacterKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { milestoneMaxLevel } from '@genshin-optimizer/zzz/util'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import React, { Suspense, useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CharSpecialtyToggle, ElementToggle } from '../toggles'
import {
  type CharacterSortKey,
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from './CharacterSort'

export function CharacterSingleSelectionModal({
  show,
  onHide,
  onSelect,
  newFirst = false,
}: {
  show: boolean
  onHide: () => void
  onSelect: (cKey: CharacterKey) => void
  newFirst?: boolean
}) {
  const { database } = useDatabaseContext()
  const displayCharacter = useDataEntryBase(database.displayCharacter)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const deferredState = useDeferredValue(displayCharacter)
  const characterKeyList = useMemo(() => {
    const { attribute, specialtyType, sortType, ascending } = deferredState
    const sortByKeys = [
      ...(newFirst ? ['new'] : []),
      ...(characterSortMap[sortType] ?? []),
    ] as CharacterSortKey[]
    const filteredKeys = allCharacterKeys
      .filter(
        filterFunction(
          { attribute, specialtyType, name: deferredSearchTerm },
          characterFilterConfigs(database)
        )
      )
      .sort(
        sortFunction(sortByKeys, ascending, characterSortConfigs(database), [
          'new',
        ])
      )
    return filteredKeys
  }, [deferredState, newFirst, deferredSearchTerm, database])

  const onClose = () => {
    setSearchTerm('')
    onHide()
  }

  const filterSearchSortProps = {
    searchTerm: searchTerm,
    onChangeSpecialtyFilter: (specialtyType: SpecialityKey[]) => {
      database.displayCharacter.set({ specialtyType })
    },
    onChangeAttributeFilter: (attribute: AttributeKey[]) => {
      database.displayCharacter.set({ attribute })
    },
    onChangeSearch: (e: ChangeEvent<HTMLTextAreaElement>) => {
      setSearchTerm(e.target.value)
    },
    onChangeSort: (sortType: CharacterSortKey) => {
      database.displayCharacter.set({ sortType })
    },
    onChangeAsc: (ascending: boolean) => {
      database.displayCharacter.set({ ascending })
    },
  }

  return (
    <CharacterSelectionModalBase
      show={show}
      charactersToShow={characterKeyList}
      filterSearchSortProps={filterSearchSortProps}
      onClose={onClose}
    >
      <CardContent sx={{ flex: '1', overflow: 'auto' }}>
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={1000} />
          }
        >
          <Grid
            container
            spacing={0.5}
            columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
          >
            {characterKeyList.map((characterKey) => (
              <Grid item key={characterKey} xs={1}>
                <CardThemed
                  bgt="light"
                  sx={(theme) => ({
                    position: 'relative',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '40px 16px 16px 40px',
                    border: `3px solid ${theme.palette.contentZzz.main}`,
                  })}
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
        </Suspense>
      </CardContent>
    </CharacterSelectionModalBase>
  )
}

type FilterSearchSortProps = {
  searchTerm: string
  onChangeSpecialtyFilter: (weaps: SpecialityKey[]) => void
  onChangeAttributeFilter: (elements: AttributeKey[]) => void
  onChangeSearch: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onChangeSort: (sortType: CharacterSortKey) => void
  onChangeAsc: (asc: boolean) => void
}

type CharacterSelectionModalBaseProps = {
  show: boolean
  charactersToShow: CharacterKey[]
  filterSearchSortProps: FilterSearchSortProps
  onClose: () => void
  children: React.ReactNode
}
const sortKeys = Object.keys(characterSortMap)

function CharacterSelectionModalBase({
  show,
  charactersToShow,
  filterSearchSortProps,
  onClose,
  children,
}: CharacterSelectionModalBaseProps) {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const displayCharacter = useDataEntryBase(database.displayCharacter)

  const charSpecialtyTotals = useMemo(
    () =>
      catTotal(allSpecialityKeys, (sk) =>
        database.chars.entries.forEach(([id, char]) => {
          const specialty = getCharStat(char.key).specialty
          sk[specialty].total++
          if (charactersToShow.includes(id)) sk[specialty].current++
        })
      ),
    [charactersToShow, database.chars.entries]
  )

  const attributeTotals = useMemo(
    () =>
      catTotal(allAttributeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const attribute = getCharStat(ck).attribute
          ct[attribute].total++
          if (charactersToShow.includes(ck)) ct[attribute].current++
        })
      ),
    [charactersToShow, database.chars.data]
  )

  const { specialtyType, attribute, sortType, ascending } = displayCharacter

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
              <CharSpecialtyToggle
                onChange={(specialtyType) =>
                  database.displayCharacter.set({ specialtyType })
                }
                value={specialtyType}
                totals={charSpecialtyTotals}
                size="small"
              />
              <ElementToggle
                onChange={(attribute) =>
                  database.displayCharacter.set({ attribute })
                }
                value={attribute}
                totals={attributeTotals}
                size="small"
              />
            </Box>
            <IconButton sx={{ ml: 'auto' }} onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box display="flex" gap={1}>
            <TextField
              autoFocus
              value={filterSearchSortProps.searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                filterSearchSortProps.onChangeSearch(e)
              }
              label={t('characterName')}
              size="small"
              sx={{ height: '100%', mr: 'auto' }}
              InputProps={{
                sx: { height: '100%' },
              }}
            />
            <SortByButton
              sortKeys={sortKeys}
              value={sortType}
              onChange={(sortType) =>
                filterSearchSortProps.onChangeSort(sortType)
              }
              ascending={ascending}
              onChangeAsc={(ascending) =>
                filterSearchSortProps.onChangeAsc(ascending)
              }
            />
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
  const theme = useTheme()
  const character = useCharacter(characterKey)
  const { rarity, attribute } = getCharStat(characterKey)
  const { level = 1, promotion = 0, mindscape = 0 } = character ?? {}
  const selectorBackgroundColor =
    attribute === 'electric'
      ? theme.palette[attribute].light
      : theme.palette[attribute].main

  return (
    <CardActionArea onClick={onClick}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          padding: '3px',
          gap: 0.5,
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0.7,
            background: selectorBackgroundColor,
          },
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: '33%', lg: '30%' },
            alignSelf: 'flex-end',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            flexShrink: 1,
          }}
        >
          <Box
            component="img"
            src={characterAsset(characterKey, 'interknot')}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            justifyContent: 'space-evenly',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ImgIcon size={1.5} src={rarityDefIcon(rarity)} />
            <Typography
              variant="subtitle2"
              sx={(theme) => ({
                flexGrow: 1,
                color: theme.palette.contentNormal.main,
                fontWeight: '900',
              })}
            >
              {t(`charNames_gen:${characterKey}`)}
            </Typography>
          </Box>
          {character ? (
            <Box
              sx={(theme) => ({
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                background: theme.palette.contentNormal.main,
                padding: '4px 12px',
                borderRadius: '20px',
              })}
            >
              <Box sx={{ textShadow: '0 0 5px gray' }}>
                <Typography
                  variant="body2"
                  component="span"
                  whiteSpace="nowrap"
                >
                  {t('charLevel', { level: level })}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                  color="text.secondary"
                >
                  /{milestoneMaxLevel[promotion]}
                </Typography>
              </Box>
              <Typography variant="body2">M{mindscape}</Typography>
            </Box>
          ) : (
            <Typography component="span" variant="body2">
              <SqBadge color={'electric'}>{t('characterEditor.new')}</SqBadge>
            </Typography>
          )}
        </Box>
      </Box>
    </CardActionArea>
  )
}
