import type {
  CharacterKey,
  LocationCharacterKey} from '@genshin-optimizer/consts';
import {
  allArtifactSlotKeys,
  allElementKeys,
  allWeaponTypeKeys,
  charKeyToLocCharKey
} from '@genshin-optimizer/consts'
import SettingsIcon from '@mui/icons-material/Settings'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  ToggleButton,
  Typography,
} from '@mui/material'
import type {
  ChangeEvent,
  MouseEvent} from 'react';
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import SlotIcon from '../../../../../Components/Artifact/SlotIcon'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import CharacterCardPico from '../../../../../Components/Character/CharacterCardPico'
import CloseButton from '../../../../../Components/CloseButton'
import InfoTooltip from '../../../../../Components/InfoTooltip'
import ModalWrapper from '../../../../../Components/ModalWrapper'
import SolidToggleButtonGroup from '../../../../../Components/SolidToggleButtonGroup'
import SqBadge from '../../../../../Components/SqBadge'
import ElementToggle from '../../../../../Components/ToggleButton/ElementToggle'
import WeaponToggle from '../../../../../Components/ToggleButton/WeaponToggle'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import { getCharSheet } from '../../../../../Data/Characters'
import { DatabaseContext } from '../../../../../Database/Database'
import type {
  AllowLocationsState} from '../../../../../Database/DataManagers/BuildSettingData';
import {
  allAllowLocationsState
} from '../../../../../Database/DataManagers/BuildSettingData'
import useBoolState from '../../../../../ReactHooks/useBoolState'
import useForceUpdate from '../../../../../ReactHooks/useForceUpdate'
import { iconInlineProps } from '../../../../../SVGIcons'
import type { ICachedCharacter } from '../../../../../Types/character'
import { characterFilterConfigs } from '../../../../../Util/CharacterSort'
import { filterFunction } from '../../../../../Util/SortByFilters'
import { bulkCatTotal } from '../../../../../Util/totalUtils'
import useBuildSetting from '../useBuildSetting'

enum CharListMode {
  ToggleToAllow,
  ToggleToExclude,
}

export default function AllowChar({
  disabled = false,
  allowListTotal,
}: {
  disabled?: boolean
  allowListTotal: string
}) {
  const { t } = useTranslation('page_character_optimize')
  const { t: t_pc } = useTranslation('page_character')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    buildSetting: { excludedLocations, allowLocationsState },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  const deferredDbDirty = useDeferredValue(dbDirty)

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [elementKeys, setElementKeys] = useState([...allElementKeys])
  const deferredElementKeys = useDeferredValue(elementKeys)
  const [weaponTypeKeys, setWeaponTypeKeys] = useState([...allWeaponTypeKeys])
  const deferredWeaponTypeKeys = useDeferredValue(weaponTypeKeys)

  const charKeyMap: Dict<CharacterKey, ICachedCharacter> = useMemo(
    () =>
      deferredDbDirty &&
      Object.fromEntries(
        Array.from(
          new Set(
            Object.entries(database.chars.data)
              .filter(([ck]) => ck !== characterKey)
              .filter(([ck]) =>
                filterFunction(
                  {
                    element: deferredElementKeys,
                    weaponType: deferredWeaponTypeKeys,
                    name: deferredSearchTerm,
                  },
                  characterFilterConfigs(database)
                )(ck)
              )
          )
        )
      ),
    [
      deferredDbDirty,
      database,
      deferredElementKeys,
      deferredWeaponTypeKeys,
      deferredSearchTerm,
      characterKey,
    ]
  )

  const locList = Object.entries(charKeyMap)
    .sort(([ck1, c1], [ck2, c2]) => {
      // sort characters by: star => more artifacts equipped
      const [choosec1, choosec2] = [-1, 1]
      const c1f = database.charMeta.get(ck1).favorite
      const c2f = database.charMeta.get(ck2).favorite
      if (c1f && !c2f) return choosec1
      else if (c2f && !c1f) return choosec2

      const art1 = Object.values(c1.equippedArtifacts).filter((id) => id).length
      const art2 = Object.values(c2.equippedArtifacts).filter((id) => id).length
      if (art1 > art2) return choosec1
      else if (art2 > art1) return choosec2
      return ck1.localeCompare(ck2)
    })
    .map(([ck]) => charKeyToLocCharKey(ck))

  const { elementTotals, weaponTypeTotals, locListTotals } = useMemo(() => {
    const catKeys = {
      elementTotals: [...allElementKeys],
      weaponTypeTotals: [...allWeaponTypeKeys],
      locListTotals: ['allowed', 'excluded'],
    } as const
    return bulkCatTotal(catKeys, (ctMap) =>
      Object.entries(database.chars.data).forEach(([ck]) => {
        const sheet = getCharSheet(ck, database.gender)
        const eleKey = sheet.elementKey
        ctMap.elementTotals[eleKey].total++
        if (charKeyMap[ck]) ctMap.elementTotals[eleKey].current++

        const weaponTypeKey = sheet.weaponTypeKey
        ctMap.weaponTypeTotals[weaponTypeKey].total++
        if (charKeyMap[ck]) ctMap.weaponTypeTotals[weaponTypeKey].current++

        const locKey = charKeyToLocCharKey(ck)
        if (ck !== characterKey && locList.includes(locKey)) {
          ctMap.locListTotals.allowed.total++
          ctMap.locListTotals.excluded.total++
          if (!excludedLocations.includes(locKey))
            ctMap.locListTotals.allowed.current++
          else ctMap.locListTotals.excluded.current++
        }
      })
    )
  }, [
    charKeyMap,
    characterKey,
    database.chars.data,
    database.gender,
    excludedLocations,
    locList,
  ])

  useEffect(
    () => database.charMeta.followAny((_) => forceUpdate()),
    [forceUpdate, database]
  )
  useEffect(
    () => database.chars.followAny((_) => forceUpdate()),
    [forceUpdate, database]
  )

  const [shouldClearList, setShouldClearList] = useState(false)

  const allowAll = useCallback(
    () =>
      buildSettingDispatch({
        excludedLocations: excludedLocations.filter(
          (key) => !locList.includes(key)
        ),
        allowLocationsState: 'customList',
      }),
    [buildSettingDispatch, excludedLocations, locList]
  )
  const disallowAll = useCallback(
    () =>
      buildSettingDispatch({
        excludedLocations: Array.from(
          new Set(excludedLocations.concat(locList))
        ),
        allowLocationsState: 'customList',
      }),
    [buildSettingDispatch, excludedLocations, locList]
  )

  const setState = useCallback(
    (_e: MouseEvent, state: AllowLocationsState) =>
      buildSettingDispatch({ allowLocationsState: state }),
    [buildSettingDispatch]
  )

  const toggleList = useCallback(
    (lkList: Set<LocationCharacterKey>) => {
      const lkArray = [...lkList]
      const newExcludedLocations = lkArray
        .filter((lk) => !excludedLocations.includes(lk))
        .concat(excludedLocations.filter((lk) => !lkArray.includes(lk)))
      buildSettingDispatch({
        excludedLocations: newExcludedLocations,
        allowLocationsState: 'customList',
      })
    },
    [excludedLocations, buildSettingDispatch]
  )

  const total = database.chars.keys.length - 1
  const useTot = total - excludedLocations.length
  const totalStr = useTot === total ? useTot : `${useTot}/${total}`
  const charactersAllowed =
    allowLocationsState === 'all'
      ? total
      : allowLocationsState === 'customList'
      ? totalStr
      : 0 // unequippedOnly
  const stateBadgeColor =
    allowLocationsState === 'all'
      ? 'success'
      : allowLocationsState === 'customList'
      ? 'info'
      : 'secondary' // unequippedOnly

  return (
    <Box
      display="flex"
      gap={1}
      onMouseUp={() => setShouldClearList(true)}
      onTouchEnd={() => setShouldClearList(true)}
    >
      {/* Begin modal */}
      <ModalWrapper
        open={show}
        onClose={onClose}
        containerProps={{ maxWidth: 'xl' }}
        draggable={false}
      >
        <CardDark>
          <CardContent>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h6">{t`excludeChar.title`}</Typography>
              <InfoTooltip
                title={<Typography>{t`excludeChar.tooltip`}</Typography>}
              />
              <Box flexGrow={1} />
              <CloseButton onClick={onClose} size="small" />
            </Box>
          </CardContent>
          <Divider />
          <CardContent sx={{ pb: 0 }}>
            <Stack gap={1}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <SolidToggleButtonGroup
                  exclusive
                  baseColor="secondary"
                  size="small"
                  value={allowLocationsState}
                  onChange={setState}
                >
                  {allAllowLocationsState.map((s) => (
                    <ToggleButton
                      key={s}
                      value={s}
                      disabled={allowLocationsState === s || disabled}
                    >
                      {t(`excludeChar.states.${s}`)}
                    </ToggleButton>
                  ))}
                </SolidToggleButtonGroup>
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
              </Box>
            </Stack>
          </CardContent>
          <CardContent
            sx={{ opacity: allowLocationsState === 'customList' ? 1 : 0.6 }}
          >
            <Box pb={1} display="flex" gap={1} flexWrap="wrap">
              <Button color="success" sx={{ flexGrow: 1 }} onClick={allowAll}>
                {t`excludeChar.modal.allow_all`}
                <SqBadge sx={{ ml: 1 }}>
                  <strong>{locListTotals.allowed}</strong>
                </SqBadge>
              </Button>
              <Button color="error" sx={{ flexGrow: 1 }} onClick={disallowAll}>
                {t`excludeChar.modal.disallow_All`}
                <SqBadge sx={{ ml: 1 }}>
                  <strong>{locListTotals.excluded}</strong>
                </SqBadge>
              </Button>
            </Box>
            <SelectItemGrid
              locList={locList}
              excludedLocations={excludedLocations}
              shouldClearList={shouldClearList}
              setShouldClearList={setShouldClearList}
              toggleList={toggleList}
            />
          </CardContent>
        </CardDark>
      </ModalWrapper>

      {/* Button to open modal */}
      <CardLight sx={{ display: 'flex', width: '100%' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <Typography>
              <strong>{t('excludeChar.title')}</strong>
            </Typography>
            <Typography>
              {t('excludeChar.usingState')}{' '}
              <SqBadge color={stateBadgeColor}>
                {t(`excludeChar.states.${allowLocationsState}`)}
              </SqBadge>
            </Typography>
            <Typography>
              {t('excludeChar.chars')}{' '}
              <SqBadge color="success">
                {charactersAllowed} <ShowChartIcon {...iconInlineProps} />
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
      </CardLight>
    </Box>
  )
}

function SelectItemGrid({
  locList,
  excludedLocations,
  shouldClearList,
  setShouldClearList,
  toggleList,
}: {
  locList: LocationCharacterKey[]
  excludedLocations: LocationCharacterKey[]
  shouldClearList: boolean
  setShouldClearList: (v: boolean) => void
  toggleList: (charList: Set<LocationCharacterKey>) => void
}) {
  const [charList, setCharList] = useState(new Set<LocationCharacterKey>())
  const [charListMode, setCharListMode] = useState<CharListMode>()
  useEffect(() => {
    if (shouldClearList) {
      toggleList(charList)
      setCharList(new Set<LocationCharacterKey>())
      setCharListMode(undefined)
      setShouldClearList(false)
    }
  }, [charList, setCharList, setShouldClearList, shouldClearList, toggleList])
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
  const { database } = useContext(DatabaseContext)
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
  const disableTooltip = useMemo(() => charList.size !== 0, [charList.size])
  const sx = {
    opacity: charList.has(locKey) ? 0.3 : selected ? undefined : 0.6,
    borderColor: selected ? 'rgb(100,200,100)' : 'rgb(200,100,100)',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderRadius: '8px',
  }
  const content = useMemo(
    () => (
      <>
        <CharacterCardPico
          characterKey={database.chars.LocationToCharacterKey(locKey)}
          disableTooltip={disableTooltip}
        />
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
      </>
    ),
    [char?.equippedArtifacts, database.chars, disableTooltip, locKey]
  )
  return (
    <CardActionArea onMouseEnter={onMouseEnter} onMouseDown={onMouseDown}>
      <CardLight sx={sx}>{content}</CardLight>
    </CardActionArea>
  )
}
