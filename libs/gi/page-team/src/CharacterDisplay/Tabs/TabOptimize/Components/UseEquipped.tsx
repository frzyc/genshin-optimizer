import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { bulkCatTotal, filterFunction } from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  allCharacterRarityKeys,
  allElementKeys,
  allWeaponTypeKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { SlotIcon } from '@genshin-optimizer/gi/svgicons'
import {
  CharacterCard,
  CharacterCardPico,
  CharacterRarityToggle,
  ElementToggle,
  SillyContext,
  WeaponToggle,
  characterFilterConfigs,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

enum CharListMode {
  ToggleToAllow,
  ToggleToExclude,
}

export default function UseEquipped({
  disabled = false,
  allowListTotal,
}: {
  disabled?: boolean
  allowListTotal: string
}) {
  const { t } = useTranslation('page_character_optimize')
  const { t: t_pc } = useTranslation('page_character')
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { silly } = useContext(SillyContext)
  const { excludedLocations } = useOptConfig(optConfigId)!
  const database = useDatabase()
  const [show, onOpen, onClose] = useBoolState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const deferredDbDirty = useDeferredValue(dbDirty)

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [elementKeys, setElementKeys] = useState([...allElementKeys])
  const deferredElementKeys = useDeferredValue(elementKeys)
  const [weaponTypeKeys, setWeaponTypeKeys] = useState([...allWeaponTypeKeys])
  const deferredWeaponTypeKeys = useDeferredValue(weaponTypeKeys)
  const [characterRarityKeys, setCharacterRarityKeys] = useState([
    ...allCharacterRarityKeys,
  ])
  const deferredCharacterRarityKeys = useDeferredValue(characterRarityKeys)

  const charKeyMap: Partial<Record<CharacterKey, ICachedCharacter>> = useMemo(
    () =>
      deferredDbDirty &&
      Object.fromEntries(
        Array.from(
          new Set(
            Object.entries(database.chars.data)
              .filter(
                ([ck]) =>
                  charKeyToLocCharKey(ck) !== charKeyToLocCharKey(characterKey)
              )
              .filter(([ck]) =>
                filterFunction(
                  {
                    element: deferredElementKeys,
                    weaponType: deferredWeaponTypeKeys,
                    rarity: deferredCharacterRarityKeys,
                    name: deferredSearchTerm,
                  },
                  characterFilterConfigs(database, silly)
                )(ck)
              )
          )
        )
      ),
    [
      deferredDbDirty,
      database,
      characterKey,
      deferredElementKeys,
      deferredWeaponTypeKeys,
      deferredCharacterRarityKeys,
      deferredSearchTerm,
      silly,
    ]
  )

  const locListLength = useMemo(
    () =>
      deferredDbDirty &&
      new Set(
        Object.keys(database.chars.data)
          .filter(
            (ck) =>
              charKeyToLocCharKey(ck) !== charKeyToLocCharKey(characterKey)
          )
          .map(charKeyToLocCharKey)
      ).size,
    [characterKey, database.chars.data, deferredDbDirty]
  )

  const locList = Array.from(
    new Set(
      Object.entries(charKeyMap)
        .sort(([ck1, c1], [ck2, c2]) => {
          // sort characters by: star => more artifacts equipped
          const [choosec1, choosec2] = [-1, 1]
          const c1f = database.charMeta.get(ck1).favorite
          const c2f = database.charMeta.get(ck2).favorite
          if (c1f && !c2f) return choosec1
          else if (c2f && !c1f) return choosec2

          const art1 = Object.values(c1.equippedArtifacts).filter(
            (id) => id
          ).length
          const art2 = Object.values(c2.equippedArtifacts).filter(
            (id) => id
          ).length
          if (art1 > art2) return choosec1
          else if (art2 > art1) return choosec2
          return ck1.localeCompare(ck2)
        })
        .map(([ck]) => charKeyToLocCharKey(ck))
    )
  )

  const {
    elementTotals,
    weaponTypeTotals,
    characterRarityTotals,
    locListTotals,
  } = useMemo(() => {
    const catKeys = {
      elementTotals: [...allElementKeys],
      weaponTypeTotals: [...allWeaponTypeKeys],
      characterRarityTotals: [...allCharacterRarityKeys],
      locListTotals: ['allowed', 'excluded'],
    } as const
    let travelerProcessed = false

    return bulkCatTotal(catKeys, (ctMap) =>
      Object.entries(database.chars.data)
        .filter(
          ([ck]) =>
            charKeyToLocCharKey(ck) !== charKeyToLocCharKey(characterKey)
        )
        .forEach(([ck]) => {
          const eleKey = getCharEle(ck)
          const charStat = getCharStat(ck)
          const weaponTypeKey = charStat.weaponType
          const characterRarityKey = charStat.rarity

          ctMap.elementTotals[eleKey].total++
          if (charKeyMap[ck]) ctMap.elementTotals[eleKey].current++

          // Handle multiple Travelers
          if (charKeyToLocCharKey(ck) === 'Traveler') {
            // Add to each element if Traveler of that element is in the database
            //
            // This makes sure that if the Traveler is in the filter,
            // counts are added to each of their elements in the database
            if (!charKeyMap[ck] && locList.includes('Traveler')) {
              ctMap.elementTotals[eleKey].current++

              // Only count the traveler once for rarity and weapon type totals
              if (travelerProcessed) return
              ctMap.weaponTypeTotals[weaponTypeKey].current++
              ctMap.characterRarityTotals[characterRarityKey].current++
            }

            travelerProcessed = true
          }

          ctMap.weaponTypeTotals[weaponTypeKey].total++
          if (charKeyMap[ck]) ctMap.weaponTypeTotals[weaponTypeKey].current++

          ctMap.characterRarityTotals[characterRarityKey].total++
          if (charKeyMap[ck])
            ctMap.characterRarityTotals[characterRarityKey].current++

          const locKey = charKeyToLocCharKey(ck)
          if (locList.includes(locKey)) {
            ctMap.locListTotals.allowed.total++
            ctMap.locListTotals.excluded.total++
            if (!excludedLocations.includes(locKey))
              ctMap.locListTotals.allowed.current++
            else ctMap.locListTotals.excluded.current++
          }
        })
    )
  }, [charKeyMap, characterKey, database, excludedLocations, locList])

  useEffect(
    () => database.charMeta.followAny((_) => forceUpdate()),
    [forceUpdate, database]
  )
  useEffect(
    () => database.chars.followAny((_) => forceUpdate()),
    [forceUpdate, database]
  )

  const [mouseUpDetected, setMouseUpDetected] = useState(false)

  const allowAll = useCallback(
    () =>
      database.optConfigs.set(optConfigId, {
        excludedLocations: excludedLocations.filter(
          (key) => !locList.includes(key)
        ),
      }),
    [database, optConfigId, excludedLocations, locList]
  )
  const disallowAll = useCallback(
    () =>
      database.optConfigs.set(optConfigId, {
        excludedLocations: Array.from(
          new Set(excludedLocations.concat(locList))
        ),
      }),
    [database, optConfigId, excludedLocations, locList]
  )

  const toggleList = useCallback(
    (lkList: Set<LocationCharacterKey>) => {
      const lkArray = [...lkList]
      const newExcludedLocations = lkArray
        .filter((lk) => !excludedLocations.includes(lk))
        .concat(excludedLocations.filter((lk) => !lkArray.includes(lk)))
      database.optConfigs.set(optConfigId, {
        excludedLocations: newExcludedLocations,
      })
    },
    [database, optConfigId, excludedLocations]
  )

  const onMouseUp = useCallback(() => setMouseUpDetected(true), [])

  // `total` shouldn't rely on `locList.length` because it gets filtered
  const total = locListLength
  const useTot = total - excludedLocations.length
  const totalStr = useTot === total ? useTot : `${useTot}/${total}`

  return (
    <Box display="flex" gap={1}>
      {/* Begin modal */}
      <ModalWrapper
        open={show}
        onClose={onClose}
        containerProps={{ maxWidth: 'xl' }}
        draggable={false}
        onMouseUp={onMouseUp}
      >
        <CardThemed>
          {/* Header */}
          <CardHeader
            title={t('excludeChar.title')}
            titleTypographyProps={{ variant: 'h6' }}
            action={
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          {/* Content */}
          <CardContent sx={{ pb: 0 }}>
            <Stack gap={1}>
              {/* State + Search box */}
              <Box display="flex" gap={1} flexWrap="wrap">
                <WeaponToggle
                  sx={{ height: '100%' }}
                  onChange={setWeaponTypeKeys}
                  value={deferredWeaponTypeKeys}
                  totals={weaponTypeTotals}
                  size="small"
                />
                <ElementToggle
                  sx={{ height: '100%' }}
                  onChange={setElementKeys}
                  value={deferredElementKeys}
                  totals={elementTotals}
                  size="small"
                />
                <CharacterRarityToggle
                  sx={{ height: '100%' }}
                  onChange={setCharacterRarityKeys}
                  value={deferredCharacterRarityKeys}
                  totals={characterRarityTotals}
                  size="small"
                />
                <TextField
                  autoFocus
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  label={t_pc('characterName')}
                  size="small"
                  sx={{ height: '100%' }}
                  InputProps={{
                    sx: { height: '100%' },
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
          {/* Allow/Disallow + grid */}
          <CardContent>
            <Grid container pb={1} gap={1} flexWrap="nowrap">
              <Grid item xs={6}>
                <Button color="success" fullWidth onClick={allowAll}>
                  {t('excludeChar.modal.allow_all')}
                  <SqBadge sx={{ ml: 1 }}>
                    <strong>{locListTotals['allowed']}</strong>
                  </SqBadge>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth color="error" onClick={disallowAll}>
                  {t('excludeChar.modal.disallow_All')}
                  <SqBadge sx={{ ml: 1 }}>
                    <strong>{locListTotals['excluded']}</strong>
                  </SqBadge>
                </Button>
              </Grid>
            </Grid>
            <SelectItemGrid
              locList={locList}
              excludedLocations={excludedLocations}
              mouseUpDetected={mouseUpDetected}
              setMouseUpDetected={setMouseUpDetected}
              toggleList={toggleList}
            />
          </CardContent>
        </CardThemed>
      </ModalWrapper>

      {/* Button to open modal */}
      <CardThemed bgt="light" sx={{ display: 'flex', width: '100%' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <Typography>
              <strong>{t('excludeChar.title')}</strong>
            </Typography>
            <Typography>
              {t('excludeChar.chars')}{' '}
              <SqBadge color="success">
                {totalStr} <ShowChartIcon {...iconInlineProps} />
                {t('artSetConfig.allowed')}
              </SqBadge>
            </Typography>
            <Typography>
              {t('excludeChar.artis')}{' '}
              <SqBadge color="success">
                {allowListTotal} <ShowChartIcon {...iconInlineProps} />
                {t('artSetConfig.allowed')}
              </SqBadge>
            </Typography>
          </Stack>
        </CardContent>
        <Button
          sx={{ borderRadius: 0, flexShrink: 1, minWidth: 40 }}
          onClick={onOpen}
          disabled={disabled}
          color="info"
        >
          <SettingsIcon />
        </Button>
      </CardThemed>
    </Box>
  )
}

function SelectItemGrid({
  locList,
  excludedLocations,
  mouseUpDetected,
  setMouseUpDetected,
  toggleList,
}: {
  locList: LocationCharacterKey[]
  excludedLocations: LocationCharacterKey[]
  mouseUpDetected: boolean
  setMouseUpDetected: (v: boolean) => void
  toggleList: (charList: Set<LocationCharacterKey>) => void
}) {
  const [charList, setCharList] = useState(new Set<LocationCharacterKey>())
  const [charListMode, setCharListMode] = useState<CharListMode>()
  useEffect(() => {
    if (mouseUpDetected) {
      setMouseUpDetected(false)
      if (charList.size > 0) {
        toggleList(charList)
        setCharList(new Set<LocationCharacterKey>())
        setCharListMode(undefined)
      }
    }
  }, [charList, setCharList, setMouseUpDetected, mouseUpDetected, toggleList])
  return (
    <Grid
      container
      spacing={1}
      columns={{ xs: 6, sm: 7, md: 10, lg: 12, xl: 16 }}
    >
      {locList.map((lk) => (
        <Grid item key={lk} xs={1}>
          <SelectItem
            locKey={lk}
            charList={charList}
            charListMode={charListMode}
            setCharList={setCharList}
            setCharListMode={setCharListMode}
            selected={!excludedLocations.includes(lk)}
          />
        </Grid>
      ))}
    </Grid>
  )
}

function SelectItem({
  locKey,
  selected,
  charList,
  charListMode,
  setCharList,
  setCharListMode,
}: {
  locKey: LocationCharacterKey
  selected: boolean
  charList: Set<LocationCharacterKey>
  charListMode?: CharListMode
  setCharList: (list: Set<LocationCharacterKey>) => void
  setCharListMode: (mode?: CharListMode) => void
}) {
  const database = useDatabase()
  const char = database.chars.get(database.chars.LocationToCharacterKey(locKey))
  const onMouseEnter = useCallback(
    (e: MouseEvent) =>
      // Mouse 1 being held down
      e.buttons === 1 &&
      // Only select characters with the same exclusion state as the rest of the list
      ((charListMode === CharListMode.ToggleToAllow && !selected) ||
        (charListMode === CharListMode.ToggleToExclude && selected)) &&
      setCharList(new Set([...charList]).add(locKey)),
    [charListMode, selected, setCharList, charList, locKey]
  )
  const onMouseDown = useCallback(() => {
    const mode = selected
      ? CharListMode.ToggleToExclude
      : CharListMode.ToggleToAllow
    setCharListMode(mode)
    setCharList(new Set([...charList]).add(locKey))
  }, [selected, setCharListMode, setCharList, charList, locKey])
  const allowed =
    // Character is already allowed, and not selected to be excluded
    (selected &&
      !(
        charListMode === CharListMode.ToggleToExclude && charList.has(locKey)
      )) ||
    // Or character is selected to be allowed
    (charListMode === CharListMode.ToggleToAllow && charList.has(locKey))
  const sx = {
    opacity: allowed ? undefined : 0.6,
    borderColor: allowed ? 'rgb(100,200,100)' : 'rgb(200,100,100)',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderRadius: '8px',
  }
  const content = useMemo(
    () => (
      <Box
        fontSize="0.85em"
        display="flex"
        justifyContent="space-between"
        p={0.3}
      >
        {allArtifactSlotKeys.map((s) => (
          <SlotIcon
            key={s}
            slotKey={s}
            iconProps={{
              fontSize: 'inherit',
              sx: { opacity: char?.equippedArtifacts[s] ? undefined : 0.5 },
            }}
          />
        ))}
      </Box>
    ),
    [char?.equippedArtifacts]
  )
  const characterKey = database.chars.LocationToCharacterKey(locKey)
  return (
    <CardThemed bgt="light" sx={sx}>
      <CharacterCardPico
        characterKey={characterKey}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        hoverChild={
          <Box sx={{ width: 300, m: -1 }}>
            <CharacterCard hideStats characterKey={characterKey} />
          </Box>
        }
      />
      {content}
    </CardThemed>
  )
}
