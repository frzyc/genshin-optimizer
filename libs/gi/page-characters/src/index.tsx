import {
  useForceUpdate,
  useMediaQueryUp,
} from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ShowingAndSortOptionSelect,
  useInfScroll,
} from '@genshin-optimizer/common/ui'
import {
  catTotal,
  filterFunction,
  sortFunction,
} from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterRarityKeys,
  allElementKeys,
  allWeaponTypeKeys,
  isCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  getCharEle,
  getCharStat,
  getWeaponStat,
} from '@genshin-optimizer/gi/stats'
import {
  CharacterCard,
  CharacterEditor,
  CharacterRarityToggle,
  CharacterSingleSelectionModal,
  ElementToggle,
  SillyContext,
  WeaponToggle,
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
  useCharSelectionCallback,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  TextField,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import {
  Suspense,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import ReactGA from 'react-ga4'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate } from 'react-router-dom'
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
const numToShowMap = { xs: 5, sm: 8, md: 9, lg: 12, xl: 12 }
const sortKeys = Object.keys(characterSortMap)

export default function PageCharacter() {
  const database = useDatabase()
  const navigate = useNavigate()
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/characters/:characterKey', end: false }) ?? {
    params: {},
  }
  const characterKey = useMemo(() => {
    if (!characterKeyRaw) return null
    if (!isCharacterKey(characterKeyRaw)) {
      navigate('/characters')
      return null
    }
    const character = database.chars.get(characterKeyRaw)
    if (!character) database.chars.getWithInitWeapon(characterKeyRaw)
    return characterKeyRaw as CharacterKey
  }, [characterKeyRaw, navigate, database])

  const { t } = useTranslation([
    'page_character',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const { silly } = useContext(SillyContext)

  const [displayCharacter, setDisplayCharacter] = useState(() =>
    database.displayCharacter.get(),
  )
  useEffect(
    () => database.displayCharacter.follow((r, s) => setDisplayCharacter(s)),
    [database, setDisplayCharacter],
  )
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const brPt = useMediaQueryUp()

  const [newCharacter, setnewCharacter] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  // Set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: '/characters' })
    return database.chars.followAny(
      (k, r) => (r === 'new' || r === 'remove') && forceUpdate(),
    )
  }, [forceUpdate, database])

  // character favorite updater
  useEffect(
    () => database.charMeta.followAny((_s) => forceUpdate()),
    [forceUpdate, database],
  )

  const editCharacter = useCharSelectionCallback()

  const deferredState = useDeferredValue(displayCharacter)
  const deferredDbDirty = useDeferredValue(dbDirty)
  const { charKeys, totalCharNum } = useMemo(() => {
    const chars = database.chars.keys
    const totalCharNum = chars.length
    const { element, weaponType, rarity, sortType, ascending } = deferredState
    const charKeys = database.chars.keys
      .filter(
        filterFunction(
          { element, weaponType, rarity, name: deferredSearchTerm },
          characterFilterConfigs(database, silly),
        ),
      )
      .sort(
        sortFunction(
          characterSortMap[sortType] ?? [],
          ascending,
          characterSortConfigs(database, silly),
          ['new', 'favorite'],
        ),
      )
    return deferredDbDirty && { charKeys, totalCharNum }
  }, [database, deferredState, deferredSearchTerm, silly, deferredDbDirty])

  const { weaponType, element, rarity, sortType, ascending } = displayCharacter

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const weapon = database.weapons.get(char.equippedWeapon)
          if (!weapon) return
          const wtk = getWeaponStat(weapon.key).weaponType
          ct[wtk].total++
          if (charKeys.includes(ck)) ct[wtk].current++
        }),
      ),
    [database, charKeys],
  )

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const eleKey = getCharEle(char.key)
          ct[eleKey].total++
          if (charKeys.includes(ck)) ct[eleKey].current++
        }),
      ),
    [database, charKeys],
  )

  const rarityTotals = useMemo(
    () =>
      catTotal(allCharacterRarityKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const key = getCharStat(char.key).rarity
          ct[key].total++
          if (charKeys.includes(ck)) ct[key].current++
        }),
      ),
    [database, charKeys],
  )

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    charKeys.length,
  )
  const charKeysToShow = useMemo(
    () => charKeys.slice(0, numShow),
    [charKeys, numShow],
  )

  const totalShowing =
    charKeys.length !== totalCharNum
      ? `${charKeys.length}/${totalCharNum}`
      : `${totalCharNum}`

  const showingTextProps = {
    numShowing: charKeysToShow.length,
    total: totalShowing,
    t: t,
    namespace: 'page_character',
  }

  const sortByButtonProps = {
    sortKeys: [...sortKeys],
    value: sortType,
    onChange: (sortType) => database.displayCharacter.set({ sortType }),
    ascending: ascending,
    onChangeAsc: (ascending) => database.displayCharacter.set({ ascending }),
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {characterKey && (
        <CharacterEditor
          characterKey={characterKey}
          onClose={() => navigate('/characters')}
        />
      )}
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          newFirst
          show={newCharacter}
          onHide={() => setnewCharacter(false)}
          onSelect={editCharacter}
        />
      </Suspense>
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1}>
            <Grid item>
              <WeaponToggle
                sx={{ height: '100%' }}
                onChange={(weaponType) =>
                  database.displayCharacter.set({ weaponType })
                }
                value={weaponType}
                totals={weaponTotals}
                size="small"
              />
            </Grid>
            <Grid item>
              <ElementToggle
                sx={{ height: '100%' }}
                onChange={(element) =>
                  database.displayCharacter.set({ element })
                }
                value={element}
                totals={elementTotals}
                size="small"
              />
            </Grid>
            <Grid item>
              <CharacterRarityToggle
                sx={{ height: '100%' }}
                onChange={(rarity) => database.displayCharacter.set({ rarity })}
                value={rarity}
                totals={rarityTotals}
                size="small"
              />
            </Grid>
            <Grid item flexGrow={1} />
            <Grid item>
              <TextField
                autoFocus
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setSearchTerm(e.target.value)
                }
                label={t('characterName')}
                size="small"
                sx={{ height: '100%' }}
                InputProps={{
                  sx: { height: '100%' },
                }}
              />
            </Grid>
          </Grid>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <ShowingAndSortOptionSelect
              showingTextProps={showingTextProps}
              sortByButtonProps={sortByButtonProps}
            />
          </Box>
        </CardContent>
      </CardThemed>
      <Button
        fullWidth
        onClick={() => setnewCharacter(true)}
        color="info"
        startIcon={<AddIcon />}
      >
        {t('addNew')}
      </Button>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {charKeysToShow.map((charKey) => (
            <Grid item key={charKey} xs={1}>
              <CharacterCard
                characterKey={charKey}
                onClick={() => navigate(`${charKey}`)}
                hideStats
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
      {charKeys.length !== charKeysToShow.length && (
        <Skeleton
          ref={(node) => {
            if (!node) return
            setTriggerElement(node)
          }}
          sx={{ borderRadius: 1 }}
          variant="rectangular"
          width="100%"
          height={100}
        />
      )}
    </Box>
  )
}
