import {
  useDataEntryBase,
  useDataManagerValues,
} from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
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
import type {
  CharacterKey,
  ElementKey,
  WeaponTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  allElementKeys,
  allWeaponTypeKeys,
  getCharMaxLevel,
} from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { commandSearchInputProps } from '../../util/commandPaletteSearch'
import {
  useCharacter,
  useCharMeta,
  useDatabase,
  useDBMeta,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import CloseIcon from '@mui/icons-material/Close'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SearchIcon from '@mui/icons-material/Search'
import type { TooltipProps } from '@mui/material'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  keyframes,
  styled,
  TextField,
  Tooltip,
  Typography,
  tooltipClasses,
} from '@mui/material'
import type React from 'react'
import type { ChangeEvent } from 'react'
import {
  memo,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext, SillyContext } from '../../context'
import { iconAsset } from '../../util/iconAsset'
import { ElementToggle, WeaponToggle } from '../toggles'
import { CharacterCard } from './CharacterCard'
import type { CharacterSortKey } from './CharacterSort'
import { useCharacterNameSearchFieldsCache } from './characterNameSearchFields'
import {
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from './CharacterSort'
import { CharacterName } from './Trans'

export function CharacterSingleSelectionModal({
  show,
  onHide,
  onSelect,
  selectedIndex = -1,
  loadoutData = [undefined, undefined, undefined, undefined],
  newFirst = false,
}: {
  show: boolean
  onHide: () => void
  onSelect: (cKey: CharacterKey) => void
  selectedIndex?: number
  loadoutData?: (LoadoutDatum | undefined)[]
  newFirst?: boolean
}) {
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const state = useDataEntryBase(database.displayCharacter)

  const teamCharKeys = useMemo(
    () =>
      loadoutData.map(
        (loadoutDatum) =>
          database.teamChars.get(loadoutDatum?.teamCharId)?.key ?? ''
      ),
    [database, loadoutData]
  )

  const [searchQuery, setSearchQuery] = useState('')
  const onDeferredSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])
  const deferredState = useDeferredValue(state)
  const charMetaDirty = useDataManagerValues(database.charMeta)
  const nameSearchFields = useCharacterNameSearchFieldsCache(
    database.gender,
    silly
  )
  const filterConfigs = useMemo(
    () => characterFilterConfigs(database, silly, nameSearchFields),
    [database, silly, nameSearchFields]
  )
  const sortConfigs = useMemo(
    () => characterSortConfigs(database, silly),
    [database, silly]
  )
  const teamSlotByKey = useMemo(() => {
    const map = new Map<CharacterKey, number>()
    teamCharKeys.forEach((key, index) => {
      if (key) map.set(key as CharacterKey, index)
    })
    return map
  }, [teamCharKeys])

  const characterKeyList = useMemo(() => {
    const { element, weaponType, sortType, ascending } = deferredState
    const sortByKeys = [
      ...(newFirst ? ['new'] : []),
      ...(characterSortMap[sortType] ?? []),
    ] as CharacterSortKey[]
    const filteredKeys =
      charMetaDirty &&
      allCharacterKeys
        .filter((key) => teamCharKeys.indexOf(key) === -1)
        .filter(
          filterFunction(
            { element, weaponType, name: searchQuery },
            filterConfigs
          )
        )
        .sort(
          sortFunction(sortByKeys, ascending, sortConfigs, ['new', 'favorite'])
        )
    return teamCharKeys.filter((key) => key !== '').concat(filteredKeys)
  }, [
    deferredState,
    newFirst,
    charMetaDirty,
    searchQuery,
    filterConfigs,
    sortConfigs,
    teamCharKeys,
  ])

  const onClose = useCallback(() => {
    onHide()
  }, [onHide])

  const onChangeWeaponFilter = useCallback(
    (weaponType: WeaponTypeKey[]) => {
      database.displayCharacter.set({ weaponType })
    },
    [database]
  )
  const onChangeElementFilter = useCallback(
    (element: ElementKey[]) => {
      database.displayCharacter.set({ element })
    },
    [database]
  )
  const onChangeSort = useCallback(
    (sortType: CharacterSortKey) => {
      if (sortType !== 'new') database.displayCharacter.set({ sortType })
    },
    [database]
  )
  const onChangeAsc = useCallback(
    (ascending: boolean) => {
      database.displayCharacter.set({ ascending })
    },
    [database]
  )

  const filterSortProps = useMemo(
    () => ({
      onChangeWeaponFilter,
      onChangeElementFilter,
      onChangeSort,
      onChangeAsc,
    }),
    [onChangeWeaponFilter, onChangeElementFilter, onChangeSort, onChangeAsc]
  )

  const handleSelect = useCallback(
    (characterKey: CharacterKey) => {
      onHide()
      onSelect(characterKey)
    },
    [onHide, onSelect]
  )

  return (
    <CharacterSelectionModalBase
      show={show}
      charactersToShow={characterKeyList}
      filterSortProps={filterSortProps}
      onDeferredSearchChange={onDeferredSearchChange}
      onClose={onClose}
    >
      <CardContent sx={{ flex: '1', overflow: 'auto' }}>
        <Grid container spacing={1} columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}>
          {characterKeyList.map((characterKey) => (
            <SingleSelectGridRow
              key={characterKey}
              characterKey={characterKey}
              selectedIndex={selectedIndex}
              teamSlotIndex={teamSlotByKey.get(characterKey) ?? -1}
              onSelect={handleSelect}
            />
          ))}
        </Grid>
      </CardContent>
    </CharacterSelectionModalBase>
  )
}

export function CharacterMultiSelectionModal({
  show,
  onHide,
  onSelect,
  loadoutData = [undefined, undefined, undefined, undefined],
  newFirst = false,
}: {
  show: boolean
  onHide: () => void
  onSelect: (cKeys: (CharacterKey | '')[]) => void
  loadoutData: (LoadoutDatum | undefined)[]
  newFirst?: boolean
}) {
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const state = useDataEntryBase(database.displayCharacter)

  const [teamCharKeys, setTeamCharKeys] = useState(['', '', '', ''] as (
    | CharacterKey
    | ''
  )[])
  // update teamCharKeys when loadoutData changes
  useEffect(
    () =>
      setTeamCharKeys(
        loadoutData.map(
          (loadoutDatum) =>
            database.teamChars.get(loadoutDatum?.teamCharId)?.key ?? ''
        )
      ),
    [database, loadoutData]
  )

  // used for generating characterKeyList below, only updated when filter/sort/search is applied to prevent characters
  // from moving around as soon as they as selected/deselected for the team
  const [cachedTeamCharKeys, setCachedTeamCharKeys] = useState([
    '',
    '',
    '',
    '',
  ] as (CharacterKey | '')[])
  useEffect(
    () =>
      setCachedTeamCharKeys(
        loadoutData.map(
          (loadoutDatum) =>
            database.teamChars.get(loadoutDatum?.teamCharId)?.key ?? ''
        )
      ),
    [database, loadoutData]
  )

  const [searchQuery, setSearchQuery] = useState('')
  const onDeferredSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])
  const deferredState = useDeferredValue(state)
  const charMetaDirty = useDataManagerValues(database.charMeta)
  const nameSearchFields = useCharacterNameSearchFieldsCache(
    database.gender,
    silly
  )
  const filterConfigs = useMemo(
    () => characterFilterConfigs(database, silly, nameSearchFields),
    [database, silly, nameSearchFields]
  )
  const sortConfigs = useMemo(
    () => characterSortConfigs(database, silly),
    [database, silly]
  )

  const teamCharKeysRef = useRef(teamCharKeys)
  useEffect(() => {
    teamCharKeysRef.current = teamCharKeys
  }, [teamCharKeys])
  useEffect(() => {
    setCachedTeamCharKeys(teamCharKeysRef.current)
  }, [searchQuery])

  const teamSlotByKey = useMemo(() => {
    const map = new Map<CharacterKey, number>()
    teamCharKeys.forEach((key, index) => {
      if (key) map.set(key as CharacterKey, index)
    })
    return map
  }, [teamCharKeys])

  const characterKeyList = useMemo(() => {
    const { element, weaponType, sortType, ascending } = deferredState
    const sortByKeys = [
      ...(newFirst ? ['new'] : []),
      ...(characterSortMap[sortType] ?? []),
    ] as CharacterSortKey[]
    const filteredKeys =
      charMetaDirty &&
      allCharacterKeys
        .filter((key) => cachedTeamCharKeys.indexOf(key) === -1)
        .filter(
          filterFunction(
            { element, weaponType, name: searchQuery },
            filterConfigs
          )
        )
        .sort(
          sortFunction(sortByKeys, ascending, sortConfigs, ['new', 'favorite'])
        )
    return cachedTeamCharKeys.filter((key) => key !== '').concat(filteredKeys)
  }, [
    deferredState,
    newFirst,
    charMetaDirty,
    searchQuery,
    filterConfigs,
    sortConfigs,
    cachedTeamCharKeys,
  ])

  const onClick = useCallback((key: CharacterKey) => {
    setTeamCharKeys((prev) => {
      const keySlotIndex = prev.indexOf(key)
      const firstOpenIndex = prev.indexOf('')
      if (keySlotIndex === -1) {
        if (firstOpenIndex === -1) return prev
        return [
          ...prev.slice(0, firstOpenIndex),
          key,
          ...prev.slice(firstOpenIndex + 1),
        ]
      }
      return [
        ...prev.slice(0, keySlotIndex),
        '',
        ...prev.slice(keySlotIndex + 1),
      ]
    })
  }, [])

  const onClose = useCallback(() => {
    onSelect(teamCharKeys)
    onHide()
  }, [onHide, onSelect, teamCharKeys])

  const syncCachedTeam = useCallback(() => {
    setCachedTeamCharKeys(teamCharKeys)
  }, [teamCharKeys])

  const onChangeWeaponFilter = useCallback(
    (weaponType: WeaponTypeKey[]) => {
      database.displayCharacter.set({ weaponType })
      syncCachedTeam()
    },
    [database, syncCachedTeam]
  )
  const onChangeElementFilter = useCallback(
    (element: ElementKey[]) => {
      database.displayCharacter.set({ element })
      syncCachedTeam()
    },
    [database, syncCachedTeam]
  )
  const onChangeSort = useCallback(
    (sortType: CharacterSortKey) => {
      if (sortType !== 'new') database.displayCharacter.set({ sortType })
      syncCachedTeam()
    },
    [database, syncCachedTeam]
  )
  const onChangeAsc = useCallback(
    (ascending: boolean) => {
      database.displayCharacter.set({ ascending })
      syncCachedTeam()
    },
    [database, syncCachedTeam]
  )

  const filterSortProps = useMemo(
    () => ({
      onChangeWeaponFilter,
      onChangeElementFilter,
      onChangeSort,
      onChangeAsc,
    }),
    [onChangeWeaponFilter, onChangeElementFilter, onChangeSort, onChangeAsc]
  )

  return (
    <CharacterSelectionModalBase
      show={show}
      charactersToShow={characterKeyList}
      filterSortProps={filterSortProps}
      onDeferredSearchChange={onDeferredSearchChange}
      onClose={onClose}
    >
      <CardContent sx={{ flex: '1', overflow: 'auto' }}>
        <Grid container spacing={1} columns={{ xs: 2, sm: 3, md: 4, lg: 5 }}>
          {characterKeyList.map((characterKey) => (
            <MultiSelectGridRow
              key={characterKey}
              characterKey={characterKey}
              teamSlotIndex={teamSlotByKey.get(characterKey) ?? -1}
              onSelect={onClick}
            />
          ))}
        </Grid>
      </CardContent>
    </CharacterSelectionModalBase>
  )
}

type CharacterSelectionFilterSortProps = {
  onChangeWeaponFilter: (weaps: WeaponTypeKey[]) => void
  onChangeElementFilter: (elements: ElementKey[]) => void
  onChangeSort: (sortType: CharacterSortKey) => void
  onChangeAsc: (asc: boolean) => void
}

type CharacterSelectionModalBaseProps = {
  show: boolean
  charactersToShow: CharacterKey[]
  filterSortProps: CharacterSelectionFilterSortProps
  onDeferredSearchChange: (search: string) => void
  onClose: () => void
  children: React.ReactNode
}
const sortKeys = Object.keys(characterSortMap)

function CharacterSelectionModalBase({
  show,
  charactersToShow,
  filterSortProps,
  onDeferredSearchChange,
  onClose,
  children,
}: CharacterSelectionModalBaseProps) {
  const { t } = useTranslation([
    'page_character',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const database = useDatabase()
  const state = useDataEntryBase(database.displayCharacter)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  useEffect(() => {
    onDeferredSearchChange(deferredSearchTerm)
  }, [deferredSearchTerm, onDeferredSearchChange])

  useEffect(() => {
    if (show) return
    setSearchTerm('')
    onDeferredSearchChange('')
  }, [show, onDeferredSearchChange])

  useEffect(() => {
    if (!show) return
    const id = requestAnimationFrame(() => searchInputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [show])

  const charactersShownSet = useMemo(
    () => new Set(charactersToShow),
    [charactersToShow]
  )

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const wtk = getCharStat(ck).weaponType
          ct[wtk].total++
          if (charactersShownSet.has(ck)) ct[wtk].current++
        })
      ),
    [charactersShownSet]
  )

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        allCharacterKeys.forEach((ck) => {
          const ele = getCharEle(ck)
          ct[ele].total++
          if (charactersShownSet.has(ck)) ct[ele].current++
        })
      ),
    [charactersShownSet]
  )

  const { weaponType, element, sortType, ascending } = state
  const teamDataContextValue = useMemo(
    () => ({ teamData: undefined }) as any,
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
              <WeaponToggle
                onChange={(weaponType) =>
                  filterSortProps.onChangeWeaponFilter(weaponType)
                }
                value={weaponType}
                totals={weaponTotals}
                size="small"
              />
              <ElementToggle
                onChange={(element) =>
                  filterSortProps.onChangeElementFilter(element)
                }
                value={element}
                totals={elementTotals}
                size="small"
              />
            </Box>
            <IconButton sx={{ ml: 'auto' }} onClick={() => onClose()}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box display="flex" gap={1}>
            <TextField
              inputRef={searchInputRef}
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setSearchTerm(e.target.value)
              }
              label={t('characterName')}
              size="small"
              sx={{ height: '100%', mr: 'auto' }}
              inputProps={commandSearchInputProps}
              InputProps={{
                sx: { height: '100%' },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <SortByButton
              sortKeys={sortKeys}
              value={sortType}
              onChange={(sortType) => filterSortProps.onChangeSort(sortType)}
              ascending={ascending}
              onChangeAsc={(ascending) =>
                filterSortProps.onChangeAsc(ascending)
              }
            />
          </Box>
        </CardContent>
        <Divider />
        <DataContext.Provider value={teamDataContextValue}>
          {children}
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

// used for wrapping SelectionCards for the single selection variant - passing
// in the appropriate selectedIndex and teamSlotIndex controls whether outlining
// and flashing the selected outline is enabled, favorite icon and the character
// tooltip are always present
const SingleSelectCardWrapper = memo(function SingleSelectCardWrapper({
  characterKey,
  children,
  selectedIndex = -1,
  teamSlotIndex = -1,
}: {
  characterKey: CharacterKey
  children: React.ReactNode
  selectedIndex: number
  teamSlotIndex: number
}) {
  const { favorite } = useCharMeta(characterKey)
  const database = useDatabase()

  const [open, onOpen, onClose] = useBoolState()

  const isInTeam = teamSlotIndex !== -1
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
      <CardThemed
        bgt="light"
        sx={(theme) => {
          const warning = theme.palette.warning.main
          const contentNormal = theme.palette.contentNormal.main
          const flash = keyframes`
            0% {outline-color: ${warning}}
            33% {outline-color: ${contentNormal}}
            66% {outline-color: ${warning}}
            100% {outline-color: ${warning}}
          `
          return {
            position: 'relative',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            outline: isInTeam ? `solid ${warning}` : undefined,
            animation:
              isInTeam && selectedIndex === teamSlotIndex
                ? `${flash} 3s ease infinite`
                : undefined,
          }
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
        {children}
      </CardThemed>
    </CustomTooltip>
  )
})

// used for wrapping SelectionCards for the multi select variant - components
// using this must provide the teamSlotIndex of the character this card is for
// (0-3 if the character is in the team being selected for, -1 otherwise)
const MultiSelectCardWrapper = memo(function MultiSelectCardWrapper({
  characterKey,
  teamSlotIndex,
  children,
}: {
  characterKey: CharacterKey
  teamSlotIndex: number
  children: React.ReactNode
}) {
  const { favorite } = useCharMeta(characterKey)
  const database = useDatabase()

  const [open, onOpen, onClose] = useBoolState()

  const isInTeam = teamSlotIndex !== -1
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
      <CardThemed
        bgt="light"
        sx={(theme) => ({
          position: 'relative',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          outline: isInTeam ? `solid ${theme.palette.warning.main}` : undefined,
        })}
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
        {isInTeam && (
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            <SqBadge
              color={'warning'}
              sx={{
                position: 'absolute',
                top: 60,
                left: 204,
                zIndex: 2,
                textShadow: '0 0 5px gray',
              }}
            >
              {teamSlotIndex + 1}
            </SqBadge>
          </Typography>
        )}
        {children}
      </CardThemed>
    </CustomTooltip>
  )
})

const SelectionCard = memo(function SelectionCard({
  characterKey,
  onSelect,
}: {
  characterKey: CharacterKey
  onSelect: (ck: CharacterKey) => void
}) {
  const { gender } = useDBMeta()
  const character = useCharacter(characterKey)
  const { silly } = useContext(SillyContext)

  const { level = 1, ascension = 0, constellation = 0 } = character ?? {}
  const banner = characterAsset(characterKey, 'banner', gender)
  const rarity = getCharStat(characterKey).rarity

  return (
    <CardActionArea onClick={() => onSelect(characterKey)}>
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
            component="img"
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
              <CharacterName characterKey={characterKey} gender={gender} />
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
                  /{getCharMaxLevel(level, ascension)}
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
  )
})

const SingleSelectGridRow = memo(function SingleSelectGridRow({
  characterKey,
  selectedIndex,
  teamSlotIndex,
  onSelect,
}: {
  characterKey: CharacterKey
  selectedIndex: number
  teamSlotIndex: number
  onSelect: (ck: CharacterKey) => void
}) {
  return (
    <Grid item xs={1}>
      <SingleSelectCardWrapper
        characterKey={characterKey}
        selectedIndex={selectedIndex}
        teamSlotIndex={teamSlotIndex}
      >
        <SelectionCard characterKey={characterKey} onSelect={onSelect} />
      </SingleSelectCardWrapper>
    </Grid>
  )
})

const MultiSelectGridRow = memo(function MultiSelectGridRow({
  characterKey,
  teamSlotIndex,
  onSelect,
}: {
  characterKey: CharacterKey
  teamSlotIndex: number
  onSelect: (ck: CharacterKey) => void
}) {
  return (
    <Grid item xs={1}>
      <MultiSelectCardWrapper
        characterKey={characterKey}
        teamSlotIndex={teamSlotIndex}
      >
        <SelectionCard characterKey={characterKey} onSelect={onSelect} />
      </MultiSelectCardWrapper>
    </Grid>
  )
})
