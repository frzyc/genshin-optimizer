import type { CharacterKey } from '@genshin-optimizer/consts'
import { allElementKeys, allWeaponTypeKeys } from '@genshin-optimizer/consts'
import {
  DeleteForever,
  FactCheck,
  Groups,
  Science,
  TrendingUp,
} from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Pagination,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import React, {
  Suspense,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import BootstrapTooltip from '../Components/BootstrapTooltip'
import CardDark from '../Components/Card/CardDark'
import CharacterCard from '../Components/Character/CharacterCard'
import SortByButton from '../Components/SortByButton'
import ElementToggle from '../Components/ToggleButton/ElementToggle'
import WeaponToggle from '../Components/ToggleButton/WeaponToggle'
import { SillyContext } from '../Context/SillyContext'
import { getCharSheet } from '../Data/Characters'
import { getWeaponSheet } from '../Data/Weapons'
import { DatabaseContext } from '../Database/Database'
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback'
import useDBMeta from '../ReactHooks/useDBMeta'
import useForceUpdate from '../ReactHooks/useForceUpdate'
import useMediaQueryUp from '../ReactHooks/useMediaQueryUp'
import { charKeyToCharName } from '../Types/consts'
import {
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from '../Util/CharacterSort'
import { filterFunction, sortFunction } from '../Util/SortByFilters'
import { catTotal } from '../Util/totalUtils'
import { clamp } from '../Util/Util'
const CharacterSelectionModal = React.lazy(
  () => import('./CharacterSelectionModal')
)
const columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
const numToShowMap = { xs: 6, sm: 8, md: 12, lg: 16, xl: 16 }
const sortKeys = Object.keys(characterSortMap)

export default function PageCharacter() {
  const { t } = useTranslation([
    'page_character',
    // Always load these 2 so character names are loaded for searching/sorting
    'sillyWisher_charNames',
    'charNames_gen',
  ])
  const { silly } = useContext(SillyContext)
  const { database } = useContext(DatabaseContext)
  const [state, setState] = useState(() => database.displayCharacter.get())
  useEffect(
    () => database.displayCharacter.follow((r, s) => setState(s)),
    [database, setState]
  )
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const invScrollRef = useRef<HTMLDivElement>(null)
  const setPage = useCallback(
    (_: ChangeEvent<unknown>, value: number) => {
      invScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
      database.displayCharacter.set({ pageIndex: value - 1 })
    },
    [database, invScrollRef]
  )

  const brPt = useMediaQueryUp()
  const maxNumToDisplay = numToShowMap[brPt]

  const [newCharacter, setnewCharacter] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  // Set follow, should run only once
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: '/characters' })
    return database.chars.followAny(
      (k, r) => (r === 'new' || r === 'remove') && forceUpdate()
    )
  }, [forceUpdate, database])

  // character favorite updater
  useEffect(
    () => database.charMeta.followAny((_s) => forceUpdate()),
    [forceUpdate, database]
  )

  const { gender } = useDBMeta()
  const deleteCharacter = useCallback(
    async (cKey: CharacterKey) => {
      let name = getCharSheet(cKey, gender).name
      // Use translated string
      if (typeof name === 'object')
        name = t(
          `${
            silly ? 'sillyWisher_charNames' : 'charNames_gen'
          }:${charKeyToCharName(cKey, gender)}`
        )

      if (!window.confirm(t('removeCharacter', { value: name }))) return
      database.chars.remove(cKey)
    },
    [database.chars, gender, silly, t]
  )

  const editCharacter = useCharSelectionCallback()

  const navigate = useNavigate()

  const deferredState = useDeferredValue(state)
  const deferredDbDirty = useDeferredValue(dbDirty)
  const { charKeyList, totalCharNum } = useMemo(() => {
    const chars = database.chars.keys
    const totalCharNum = chars.length
    const { element, weaponType, sortType, ascending } = deferredState
    const charKeyList = database.chars.keys
      .filter(
        filterFunction(
          { element, weaponType, name: deferredSearchTerm },
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
    return deferredDbDirty && { charKeyList, totalCharNum }
  }, [database, deferredState, deferredSearchTerm, silly, deferredDbDirty])

  const { weaponType, element, sortType, ascending, pageIndex = 0 } = state

  const { charKeyListToShow, numPages, currentPageIndex } = useMemo(() => {
    const numPages = Math.ceil(charKeyList.length / maxNumToDisplay)
    const currentPageIndex = clamp(pageIndex, 0, numPages - 1)
    return {
      charKeyListToShow: charKeyList.slice(
        currentPageIndex * maxNumToDisplay,
        (currentPageIndex + 1) * maxNumToDisplay
      ),
      numPages,
      currentPageIndex,
    }
  }, [charKeyList, pageIndex, maxNumToDisplay])

  const totalShowing =
    charKeyList.length !== totalCharNum
      ? `${charKeyList.length}/${totalCharNum}`
      : `${totalCharNum}`

  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponTypeKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const weapon = database.weapons.get(char.equippedWeapon)
          if (!weapon) return
          const wtk = getWeaponSheet(weapon.key).weaponType
          ct[wtk].total++
          if (charKeyList.includes(ck)) ct[wtk].current++
        })
      ),
    [database, charKeyList]
  )

  const elementTotals = useMemo(
    () =>
      catTotal(allElementKeys, (ct) =>
        Object.entries(database.chars.data).forEach(([ck, char]) => {
          const eleKey = getCharSheet(char.key, database.gender).elementKey
          ct[eleKey].total++
          if (charKeyList.includes(ck)) ct[eleKey].current++
        })
      ),
    [database, charKeyList]
  )

  return (
    <Box my={1} display="flex" flexDirection="column" gap={1}>
      <Suspense fallback={false}>
        <CharacterSelectionModal
          newFirst
          show={newCharacter}
          onHide={() => setnewCharacter(false)}
          onSelect={editCharacter}
        />
      </Suspense>
      <CardDark ref={invScrollRef}>
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
            alignItems="flex-end"
            flexWrap="wrap"
          >
            <Pagination
              count={numPages}
              page={currentPageIndex + 1}
              onChange={setPage}
            />
            <ShowingCharacter
              numShowing={charKeyListToShow.length}
              total={totalShowing}
              t={t}
            />
            <SortByButton
              sortKeys={sortKeys}
              value={sortType}
              onChange={(sortType) =>
                database.displayCharacter.set({ sortType })
              }
              ascending={ascending}
              onChangeAsc={(ascending) =>
                database.displayCharacter.set({ ascending })
              }
            />
          </Box>
        </CardContent>
      </CardDark>
      <Button
        fullWidth
        onClick={() => setnewCharacter(true)}
        color="info"
        startIcon={<AddIcon />}
      >{t`addNew`}</Button>
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: '100%', minHeight: 5000 }}
          />
        }
      >
        <Grid container spacing={1} columns={columns}>
          {charKeyListToShow.map((charKey) => (
            <Grid item key={charKey} xs={1}>
              <CharacterCard
                characterKey={charKey}
                onClick={() => navigate(`${charKey}`)}
                footer={
                  <>
                    <Divider />
                    <Box
                      sx={{
                        py: 1,
                        px: 2,
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'space-between',
                      }}
                    >
                      <BootstrapTooltip
                        placement="top"
                        title={<Typography>{t('tabs.talent')}</Typography>}
                      >
                        <IconButton
                          onClick={() => navigate(`${charKey}/talent`)}
                        >
                          <FactCheck />
                        </IconButton>
                      </BootstrapTooltip>
                      <BootstrapTooltip
                        placement="top"
                        title={<Typography>{t('tabs.teambuffs')}</Typography>}
                      >
                        <IconButton
                          onClick={() => navigate(`${charKey}/teambuffs`)}
                        >
                          <Groups />
                        </IconButton>
                      </BootstrapTooltip>
                      <BootstrapTooltip
                        placement="top"
                        title={<Typography>{t('tabs.optimize')}</Typography>}
                      >
                        <IconButton
                          onClick={() => navigate(`${charKey}/optimize`)}
                        >
                          <TrendingUp />
                        </IconButton>
                      </BootstrapTooltip>
                      <BootstrapTooltip
                        placement="top"
                        title={<Typography>{t('tabs.theorycraft')}</Typography>}
                      >
                        <IconButton
                          onClick={() => navigate(`${charKey}/theorycraft`)}
                        >
                          <Science />
                        </IconButton>
                      </BootstrapTooltip>
                      <Divider orientation="vertical" />
                      <BootstrapTooltip
                        placement="top"
                        title={<Typography>{t('delete')}</Typography>}
                      >
                        <IconButton
                          color="error"
                          onClick={() => deleteCharacter(charKey)}
                        >
                          <DeleteForever />
                        </IconButton>
                      </BootstrapTooltip>
                    </Box>
                  </>
                }
              />
            </Grid>
          ))}
        </Grid>
      </Suspense>
      {numPages > 1 && (
        <CardDark>
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setnewCharacter(true)}
              color="info"
              sx={{ minWidth: 0 }}
            >
              <AddIcon />
            </Button>
            <Grid container alignItems="flex-end" sx={{ flexGrow: 1 }}>
              <Grid item flexGrow={1}>
                <Pagination
                  count={numPages}
                  page={currentPageIndex + 1}
                  onChange={setPage}
                />
              </Grid>
              <Grid item>
                <ShowingCharacter
                  numShowing={charKeyListToShow.length}
                  total={totalShowing}
                  t={t}
                />
              </Grid>
            </Grid>
          </CardContent>
        </CardDark>
      )}
    </Box>
  )
}
function ShowingCharacter({ numShowing, total, t }) {
  return (
    <Typography color="text.secondary">
      <Trans t={t} i18nKey="showingNum" count={numShowing} value={total}>
        Showing <b>{{ count: numShowing } as TransObject}</b> out of{' '}
        {{ value: total } as TransObject} Characters
      </Trans>
    </Typography>
  )
}
