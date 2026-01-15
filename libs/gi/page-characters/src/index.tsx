import {
  useDataEntryBase,
  useDataManagerKeys,
  useDataManagerValues,
} from '@genshin-optimizer/common/database-ui'
import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ShowingAndSortOptionSelect,
  useInfScroll,
  useIsMount,
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
import type { CharacterSortKey } from '@genshin-optimizer/gi/ui'
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
    'sillywisher_charNames_gen',
    'charNames_gen',
  ])
  const { silly } = useContext(SillyContext)

  const displayCharacter = useDataEntryBase(database.displayCharacter)

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const brPt = useMediaQueryUp()

  const [newCharacter, setnewCharacter] = useState(false)
  if (useIsMount()) ReactGA.send({ hitType: 'pageview', page: '/characters' })

  // character favorite updater
  const characterMetaDirty = useDataManagerValues(database.charMeta)

  const editCharacter = useCharSelectionCallback()
  const charKeys = useDataManagerKeys(database.chars)
  const totalCharNum = charKeys.length

  const filteredCharKeys = useMemo(() => {
    const { element, weaponType, rarity, sortType, ascending } =
      displayCharacter
    return (
      characterMetaDirty &&
      charKeys
        .filter(
          filterFunction(
            { element, weaponType, rarity, name: deferredSearchTerm },
            characterFilterConfigs(database, silly)
          )
        )
        .sort(
          sortFunction(
            characterSortMap[sortType] ?? [],
            ascending,
            characterSortConfigs(database, silly),
            ['new', 'favorite']
          )
        )
    )
  }, [
    displayCharacter,
    characterMetaDirty,
    charKeys,
    deferredSearchTerm,
    database,
    silly,
  ])

  const { weaponType, element, rarity, sortType, ascending } = displayCharacter

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const weapon = database.weapons.get(char.equippedWeapon)
          if (!weapon) return
          const wtk = getWeaponStat(weapon.key).weaponType
          ct[wtk].total++
          if (filteredCharKeys.includes(ck)) ct[wtk].current++
        })
      ),
    [database, filteredCharKeys]
  )

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const eleKey = getCharEle(char.key)
          ct[eleKey].total++
          if (filteredCharKeys.includes(ck)) ct[eleKey].current++
        })
      ),
    [database, filteredCharKeys]
  )

  const rarityTotals = useMemo(
    () =>
      catTotal(allCharacterRarityKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const key = getCharStat(char.key).rarity as 5 | 4
          ct[key].total++
          if (filteredCharKeys.includes(ck)) ct[key].current++
        })
      ),
    [database, filteredCharKeys]
  )

  const { numShow, setTriggerElement } = useInfScroll(
    numToShowMap[brPt],
    filteredCharKeys.length
  )
  const charKeysToShow = useMemo(
    () => filteredCharKeys.slice(0, numShow),
    [filteredCharKeys, numShow]
  )

  const totalShowing =
    filteredCharKeys.length !== totalCharNum
      ? `${filteredCharKeys.length}/${totalCharNum}`
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
    onChange: (sortType: CharacterSortKey) =>
      database.displayCharacter.set({ sortType }),
    ascending: ascending,
    onChangeAsc: (ascending: boolean) =>
      database.displayCharacter.set({ ascending }),
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
      {filteredCharKeys.length !== charKeysToShow.length && (
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
