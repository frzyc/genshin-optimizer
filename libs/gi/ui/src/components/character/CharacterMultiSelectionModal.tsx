'use client'
import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  NextImage,
  SortByButton,
  SqBadge,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import {
  catTotal,
  filterFunction,
  sortFunction,
} from '@genshin-optimizer/common/util'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  allElementKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import {
  useCharMeta,
  useCharacter,
  useDBMeta,
  useDatabase,
  useTeam,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { ascensionMaxLevel } from '@genshin-optimizer/gi/util'
import CloseIcon from '@mui/icons-material/Close'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import type { TooltipProps } from '@mui/material'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  styled,
  tooltipClasses,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext, SillyContext } from '../../context'
import { iconAsset } from '../../util/iconAsset'
import { ElementToggle, WeaponToggle } from '../toggles'
import { CharacterCard } from './CharacterCard'
import type { CharacterSortKey } from './CharacterSort'
import {
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from './CharacterSort'
import { CharacterName } from './Trans'

type CharacterMultiSelectionModalProps = {
  show: boolean
  newFirst?: boolean
  onHide: () => void
  onMultiSelect?: (cKeys: (CharacterKey | '')[]) => void
  teamId: string
}
const sortKeys = Object.keys(characterSortMap)
export function CharacterMultiSelectionModal({
  show,
  onHide,
  onMultiSelect,
  teamId,
  newFirst = false,
}: CharacterMultiSelectionModalProps) {
  const { t } = useTranslation([
    'page_character',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const [state, setState] = useState(() => database.displayCharacter.get())
  useEffect(
    () => database.displayCharacter.follow((r, s) => setState(s)),
    [database, setState]
  )

  const { loadoutData } = useTeam(teamId)!
  const [teamCharKeys, setTeamCharKeys] = useState(['','','',''] as (CharacterKey | '')[])
  // update teamCharKeys when loadoutData changes
  useEffect( () => setTeamCharKeys(loadoutData.map((loadoutDatum) =>
    database.teamChars.get(loadoutDatum?.teamCharId)?.key ?? ''
  )),[database, loadoutData, setTeamCharKeys])

  // used for generating characterKeyList below, only updated when filter/sort/search is applied to prevent characters
  // from moving around as soon as they as selected/deselected for the team
  const [cachedTeamCharKeys, setCachedTeamCharKeys] = useState(['','','',''] as (CharacterKey | '')[])
  useEffect( () => setCachedTeamCharKeys(loadoutData.map((loadoutDatum) =>
    database.teamChars.get(loadoutDatum?.teamCharId)?.key ?? ''
  )),[database, loadoutData, setCachedTeamCharKeys])

  const [dbDirty, forceUpdate] = useForceUpdate()

  // character favorite updater
  useEffect(
    () => database.charMeta.followAny(() => forceUpdate()),
    [forceUpdate, database]
  )

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const deferredState = useDeferredValue(state)
  const deferredDbDirty = useDeferredValue(dbDirty)
  const characterKeyList = useMemo(() => {
    const { element, weaponType, sortType, ascending } = deferredState
    const sortByKeys = [
      ...(newFirst ? ['new'] : []),
      ...(characterSortMap[sortType] ?? []),
    ] as CharacterSortKey[]
    if (deferredDbDirty)
    {
      const filteredKeys = allCharacterKeys
        .filter(
          (key) => cachedTeamCharKeys.indexOf(key) === -1
        )
        .filter(
          filterFunction(
            { element, weaponType, name: deferredSearchTerm },
            characterFilterConfigs(database, silly)
          )
        )
        .sort(
          sortFunction(
            sortByKeys,
            ascending,
            characterSortConfigs(database, silly),
            ['new', 'favorite']
          )
        )
      return cachedTeamCharKeys.filter((key) => key !== '').concat(filteredKeys)
    }
    return deferredDbDirty
  }, [
    deferredState,
    newFirst,
    deferredDbDirty,
    deferredSearchTerm,
    database,
    cachedTeamCharKeys,
    silly,
  ])

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const wtk = getCharStat(ck).weaponType
          ct[wtk].total++
          if (characterKeyList.includes(ck)) ct[wtk].current++
        })
      ),
    [characterKeyList]
  )

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const ele = getCharEle(ck)
          ct[ele].total++
          if (characterKeyList.includes(ck)) ct[ele].current++
        })
      ),
    [characterKeyList]
  )

  const { weaponType, element, sortType, ascending } = state

  const onClick = (key: CharacterKey) => {
    const keySlotIndex = teamCharKeys.indexOf(key)
    const firstOpenIndex = teamCharKeys.indexOf('')
    if (keySlotIndex === -1)
    {
      // Selected character was previously unselected, add to the list of currently selected keys if team is not full
      if (firstOpenIndex === -1) return
      setTeamCharKeys([
        ...teamCharKeys.slice(0, firstOpenIndex),
        key,
        ...teamCharKeys.slice(firstOpenIndex + 1)
      ])
    }
    else
    {
      // Selected character was previously selected, so replace the slot with
      // '' to indicate the slot is currently empty
      setTeamCharKeys([
        ...teamCharKeys.slice(0, keySlotIndex),
        '',
        ...teamCharKeys.slice(keySlotIndex + 1)
      ])
    }
  }

  return (
    <ModalWrapper
      open={show}
      onClose={() => {
        setSearchTerm('')
        onMultiSelect?.(teamCharKeys)
        onHide()
      }}
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
              <WeaponToggle
                onChange={(weaponType) => {
                  database.displayCharacter.set({ weaponType })
                  setCachedTeamCharKeys(teamCharKeys)
                }}
                value={weaponType}
                totals={weaponTotals}
                size="small"
              />
              <ElementToggle
                onChange={(element) => {
                  database.displayCharacter.set({ element })
                  setCachedTeamCharKeys(teamCharKeys)
                }}
                value={element}
                totals={elementTotals}
                size="small"
              />
            </Box>
            <IconButton
              sx={{ ml: 'auto' }}
              onClick={() => {
                setSearchTerm('')
                onMultiSelect?.(teamCharKeys)
                onHide()
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box display="flex" gap={1}>
            <TextField
              autoFocus
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setSearchTerm(e.target.value)
                setCachedTeamCharKeys(teamCharKeys)
              }}
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
              onChange={(sortType) => {
                database.displayCharacter.set({ sortType })
                setCachedTeamCharKeys(teamCharKeys)
              }}
              ascending={ascending}
              onChangeAsc={(ascending) => {
                database.displayCharacter.set({ ascending })
                setCachedTeamCharKeys(teamCharKeys)
              }}
            />
          </Box>
        </CardContent>
        <Divider />
        <DataContext.Provider value={{ teamData: undefined } as any}>
          <CardContent sx={{ flex: '1', overflow: 'auto' }}>
            <Grid
              container
              spacing={1}
              columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}
            >
              {characterKeyList.map((characterKey) => (
                <Grid item key={characterKey} xs={1}>
                  <SelectionCard
                    characterKey={characterKey}
                    onClick={() => onClick(characterKey)}
                    selectedIndex = {teamCharKeys.indexOf(characterKey)}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </DataContext.Provider>
      </CardThemed>
    </ModalWrapper>
  )
}

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: 0,
  },
})

function SelectionCard({
  characterKey,
  onClick,
  selectedIndex,
}: {
  characterKey: CharacterKey
  onClick: () => void
  selectedIndex: number
}) {
  const { gender } = useDBMeta()
  const character = useCharacter(characterKey)
  const { favorite } = useCharMeta(characterKey)
  const database = useDatabase()
  const { silly } = useContext(SillyContext)

  const [open, onOpen, onClose] = useBoolState()

  const { level = 1, ascension = 0, constellation = 0 } = character ?? {}
  const banner = characterAsset(characterKey, 'banner', gender)
  const rarity = getCharStat(characterKey).rarity

  const isSelected = selectedIndex !== -1
  return (
    <CustomTooltip
      enterDelay={300}
      enterNextDelay={300}
      arrow
      placement="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      title={
        <Box sx={{ width: 300 }}>
          <CharacterCard hideStats characterKey={characterKey} />
        </Box>
      }
    >
      <Box>
        <CardThemed
          bgt="light"
          sx={{
            position: 'relative',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            outline: isSelected
              ? 'solid #f7bd10'
              : undefined,
          }}
        >
          <IconButton
            sx={{ p: 0.25, position: 'absolute', zIndex: 2, opacity: 0.7 }}
            onClick={(_) => {
              onClose()
              database.charMeta.set(characterKey, { favorite: !favorite })
            }}
          >
            {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          {isSelected && (
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              <SqBadge
                color={'warning'}
                sx={{ position: 'absolute', top: 60, left: 204, zIndex: 2, textShadow: '0 0 5px gray' }}
              >
                {selectedIndex + 1}
              </SqBadge>
            </Typography>
          )}
          <CardActionArea onClick={onClick}>
            <Box
              display="flex"
              position="relative"
              className={!banner ? `grad-${rarity}star` : undefined}
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
                sx={{ maxWidth: { xs: '33%', lg: '30%' } }}
                alignSelf="flex-end"
                display="flex"
                flexDirection="column"
                zIndex={1}
              >
                <Box
                  component={NextImage ? NextImage : 'img'}
                  src={iconAsset(characterKey, gender, silly)}
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
                    color={getCharEle(characterKey)}
                    sx={{ opacity: 0.85, textShadow: '0 0 5px gray' }}
                  >
                    <CharacterName
                      characterKey={characterKey}
                      gender={gender}
                    />
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
                        Lv. {level}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="span"
                        color="text.secondary"
                      >
                        /{ascensionMaxLevel[ascension]}
                      </Typography>
                    </Box>
                    <Typography variant="body2">C{constellation}</Typography>
                  </Box>
                ) : (
                  <Typography component="span" variant="body2">
                    <SqBadge>NEW</SqBadge>
                  </Typography>
                )}
                <StarsDisplay stars={rarity} colored />
              </Box>
            </Box>
          </CardActionArea>
        </CardThemed>
      </Box>
    </CustomTooltip>
  )
}
