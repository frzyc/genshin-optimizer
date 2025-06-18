import {
  useDataEntryBase,
  useDataManagerKeys,
} from '@genshin-optimizer/common/database-ui'
import { useMediaQueryUp } from '@genshin-optimizer/common/react-util'
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
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import {
  useCharOpt,
  useCharacter,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import {
  CharCalcProvider,
  CharacterEditor,
} from '@genshin-optimizer/zzz/formula-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import type { CharacterSortKey } from '@genshin-optimizer/zzz/ui'
import {
  CharSpecialtyToggle,
  CharacterCard,
  CharacterRarityToggle,
  CharacterSingleSelectionModal,
  ElementToggle,
  StatHighlightContext,
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from '@genshin-optimizer/zzz/ui'
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
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate } from 'react-router-dom'

const columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
const numToShowMap = { xs: 1, sm: 2, md: 2, lg: 3, xl: 12 }
const sortKeys = Object.keys(characterSortMap)

export default function PageCharacter() {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const navigate = useNavigate()
  const {
    params: { characterKey: characterKeyRaw },
  } = useMatch({ path: '/characters/:characterKey', end: false }) ?? {
    params: {},
  }
  const displayCharacter = useDataEntryBase(database.displayCharacter)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const [statHighlight, setStatHighlight] = useState('')
  const statHLContextObj = useMemo(
    () => ({ statHighlight, setStatHighlight }),
    [statHighlight, setStatHighlight]
  )

  const characterKey = useMemo(() => {
    if (!characterKeyRaw) return null
    if (!allCharacterKeys.includes(characterKeyRaw as CharacterKey)) {
      navigate('/characters')
      return null
    }
    return characterKeyRaw as CharacterKey
  }, [characterKeyRaw, navigate])
  const character = useCharacter(characterKey ?? undefined)
  const charOpt =
    useCharOpt(characterKey ?? undefined) ??
    (characterKey && database.charOpts.getOrCreate(characterKey))
  const tag = useMemo<Tag>(
    () => ({
      src: characterKey,
      dst: characterKey,
      preset: `preset0`,
    }),
    [characterKey]
  )

  const [newCharacter, setnewCharacter] = useState(false)

  const editCharacter = useCallback(
    (characterKey: CharacterKey) => {
      const character = database.chars.get(characterKey)
      if (!character) {
        database.chars.getOrCreate(characterKey)
      }
      navigate(`/characters/${characterKey}`)
    },
    [database.chars, navigate]
  )
  const charKeys = useDataManagerKeys(database.chars)
  const totalCharNum = charKeys.length
  const filteredCharKeys = useMemo(() => {
    const { attribute, specialtyType, rarity, sortType, ascending } =
      displayCharacter
    return charKeys
      .filter(
        filterFunction(
          { attribute, specialtyType, rarity, name: deferredSearchTerm },
          characterFilterConfigs(database)
        )
      )
      .sort(
        sortFunction(
          characterSortMap[sortType] ?? [],
          ascending,
          characterSortConfigs(database),
          ['new']
        )
      )
  }, [displayCharacter, charKeys, deferredSearchTerm, database])

  const { specialtyType, attribute, rarity, sortType, ascending } =
    displayCharacter

  const charSpecialtyTotals = useMemo(
    () =>
      catTotal(allSpecialityKeys, (sk) =>
        database.chars.entries.forEach(([id, char]) => {
          const specialty = getCharStat(char.key).specialty
          sk[specialty].total++
          if (database.chars.keys.includes(id)) sk[specialty].current++
        })
      ),
    [database]
  )

  const attributeTotals = useMemo(
    () =>
      catTotal(allAttributeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const attribute = getCharStat(ck).attribute
          ct[attribute].total++
          if (database.chars.keys.includes(ck)) ct[attribute].current++
        })
      ),
    [database]
  )

  const rarityTotals = useMemo(
    () =>
      catTotal(allCharacterRarityKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck]) => {
          const rarity = getCharStat(ck).rarity
          ct[rarity].total++
          if (database.chars.keys.includes(ck)) ct[rarity].current++
        })
      ),
    [database]
  )
  const brPt = useMediaQueryUp()
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
    onChange: (sortType: string) =>
      database.displayCharacter.set({ sortType: sortType as CharacterSortKey }),
    ascending: ascending,
    onChangeAsc: (ascending: boolean) =>
      database.displayCharacter.set({ ascending }),
  }
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {characterKey && character && charOpt && (
        <TagContext.Provider value={tag}>
          <StatHighlightContext.Provider value={statHLContextObj}>
            <CharCalcProvider
              character={character}
              charOpt={charOpt}
              wengineId={character.equippedWengine}
              discIds={character.equippedDiscs}
            >
              <CharacterEditor
                characterKey={characterKey}
                onClose={() => navigate('/characters')}
              />
            </CharCalcProvider>
          </StatHighlightContext.Provider>
        </TagContext.Provider>
      )}
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={newCharacter}
          onHide={() => setnewCharacter(false)}
          onSelect={editCharacter}
          newFirst={true}
        />
      </Suspense>
      <CardThemed>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1}>
            <Grid item>
              <CharSpecialtyToggle
                sx={{ height: '100%' }}
                onChange={(specialtyType) =>
                  database.displayCharacter.set({ specialtyType })
                }
                value={specialtyType}
                totals={charSpecialtyTotals}
                size="small"
              ></CharSpecialtyToggle>
            </Grid>
            <Grid item>
              <ElementToggle
                sx={{ height: '100%' }}
                onChange={(attribute) =>
                  database.displayCharacter.set({ attribute })
                }
                value={attribute}
                totals={attributeTotals}
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
        <Grid container spacing={2} columns={columns}>
          {charKeysToShow.map((charKey) => (
            <Grid item key={charKey} xs={1}>
              <CharacterCard
                characterKey={charKey}
                onClick={() => navigate(`${charKey}`)}
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
