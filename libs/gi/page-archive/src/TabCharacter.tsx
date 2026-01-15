import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ColorText, ImgIcon, useInfScroll } from '@genshin-optimizer/common/ui'
import type { SortConfigs } from '@genshin-optimizer/common/util'
import { handleMultiSelect, sortFunction } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type {
  ArchiveCharacterOption,
  ICachedCharacter,
} from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { i18n } from '@genshin-optimizer/gi/i18n'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import {
  CharacterName,
  SillyContext,
  iconAsset,
} from '@genshin-optimizer/gi/ui'
import SearchIcon from '@mui/icons-material/Search'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import type { Palette } from '@mui/material'
import {
  Box,
  CardContent,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  Suspense,
  memo,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { CharacterView } from './CharacterView'
const rarties = [5, 4] as const
export default function TabCharacter() {
  const { silly } = useContext(SillyContext)
  const database = useDatabase()
  const archive = useDataEntryBase(database.displayArchive)
  const handleRarity = handleMultiSelect([...rarties])
  const handleType = handleMultiSelect([...allWeaponTypeKeys])
  const [searchTerm, setSearchTerm] = useState('')
  const searchTermDeferred = useDeferredValue(searchTerm)

  const { character } = archive
  const characterOptionDispatch = useCallback(
    (option: Partial<ArchiveCharacterOption>) =>
      database.displayArchive.set({ character: { ...character, ...option } }),
    [database, character]
  )
  const charKeys = useMemo(() => {
    return allCharacterKeys.filter((cKey) => {
      const { rarity, weaponType } = getCharStat(cKey)
      if (!character.rarity.includes(rarity as (typeof rarties)[number]))
        return false
      if (!character.weaponType.includes(weaponType)) return false

      const nameStr = i18n.t(`charNames_gen:${cKey}`)
      const sillyStr =
        silly && i18n.exists(`sillywisher_charNames_gen:${cKey}`)
          ? i18n.t(`sillywisher_charNames_gen:${cKey}`)
          : ''
      if (
        searchTermDeferred &&
        !nameStr
          .toLocaleLowerCase()
          .includes(searchTermDeferred.toLocaleLowerCase()) &&
        !sillyStr
          .toLocaleLowerCase()
          .includes(searchTermDeferred.toLocaleLowerCase())
      )
        return false
      return true
    })
  }, [character, searchTermDeferred, silly])

  const { numShow, setTriggerElement } = useInfScroll(10, charKeys.length)
  type SortKey = 'name' | 'rarity' | 'element' | 'type'
  const handleSort = (property: SortKey) => {
    const isAsc =
      character.sortOrderBy === property && character.sortOrder === 'asc'
    characterOptionDispatch({
      sortOrder: isAsc ? 'desc' : 'asc',
      sortOrderBy: property,
    })
  }

  const sortedCharKeys = useMemo(
    () =>
      sortFunction([character.sortOrderBy], character.sortOrder === 'asc', {
        name: (cKey: CharacterKey) =>
          silly && i18n.exists(`sillywisher_charNames_gen:${cKey}`)
            ? i18n.t(`sillywisher_charNames_gen:${cKey}`)
            : i18n.t(`charNames_gen:${cKey}`),
        rarity: (cKey: CharacterKey) => getCharStat(cKey).rarity,
        element: (cKey: CharacterKey) => getCharEle(cKey),
        type: (cKey: CharacterKey) => getCharStat(cKey).weaponType,
      } as SortConfigs<SortKey, CharacterKey>),
    [character.sortOrder, character.sortOrderBy, silly]
  )
  const charKeysToShow = useMemo(
    () => charKeys.sort(sortedCharKeys).slice(0, numShow),
    [charKeys, numShow, sortedCharKeys]
  )
  const columns: { key: SortKey; label: string; width: number }[] = [
    { key: 'name', label: 'Name', width: 40 },
    { key: 'rarity', label: 'Rarity', width: 20 },
    { key: 'element', label: 'Element', width: 20 },
    { key: 'type', label: 'Type', width: 20 },
  ]
  return (
    <Box>
      <CardContent sx={{ display: 'flex', gap: 2 }}>
        <ToggleButtonGroup value={character.rarity}>
          {rarties.map((r) => (
            <ToggleButton
              key={r}
              value={r}
              onClick={() =>
                characterOptionDispatch({
                  rarity: handleRarity(character.rarity, r),
                })
              }
            >
              <ColorText color={`rarity${r}` as keyof Palette}>
                <StarRoundedIcon sx={{ verticalAlign: 'text-top' }} />
              </ColorText>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup value={character.weaponType}>
          {allWeaponTypeKeys.map((wt) => (
            <ToggleButton
              key={wt}
              value={wt}
              onClick={() =>
                characterOptionDispatch({
                  weaponType: handleType(character.weaponType, wt),
                })
              }
            >
              <ImgIcon src={imgAssets.weaponTypes?.[wt]} size={2} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          fullWidth
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </CardContent>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(({ key, label, width }) => (
              <TableCell
                sortDirection={
                  character.sortOrderBy === key ? character.sortOrder : false
                }
                width={`${width}%`}
              >
                <TableSortLabel
                  active={character.sortOrderBy === key}
                  direction={
                    character.sortOrderBy === key ? character.sortOrder : 'asc'
                  }
                  onClick={() => handleSort(key)}
                >
                  {label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {charKeysToShow.map((wKey) => (
            <CharacterRow key={wKey} characterKey={wKey} />
          ))}
          {charKeysToShow.length !== charKeys.length && (
            <TableRow>
              <TableCell colSpan={5}>
                <Skeleton
                  ref={(node) => {
                    if (!node) return
                    setTriggerElement(node)
                  }}
                  sx={{ borderRadius: 1 }}
                  variant="rectangular"
                  width="100%"
                  height={50}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}
const CharacterRow = memo(function CharacterRow({
  characterKey: cKey,
}: {
  characterKey: CharacterKey
}) {
  const { silly } = useContext(SillyContext)
  const { gender } = useDBMeta()
  const [show, onShow, onHide] = useBoolState()
  const { rarity, weaponType } = getCharStat(cKey)
  const element = getCharEle(cKey)
  const character = useMemo(
    () =>
      ({
        key: cKey,
        level: 90,
        ascension: 6,
        constellation: 6,
        talent: {
          auto: 10,
          skill: 10,
          burst: 10,
        },
      }) as ICachedCharacter,
    [cKey]
  )
  return (
    <Suspense
      fallback={
        <TableRow>
          <TableCell colSpan={4}>
            <Skeleton
              sx={{ borderRadius: 1 }}
              variant="rectangular"
              width="100%"
              height={50}
            />
          </TableCell>
        </TableRow>
      }
    >
      <CharacterView show={show} character={character} onClose={onHide} />
      <TableRow hover onClick={onShow} sx={{ cursor: 'pointer' }}>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImgIcon size={4} src={iconAsset(cKey, gender, silly)} />
            <CharacterName characterKey={cKey} gender={gender} />
          </Box>
        </TableCell>

        <TableCell>
          <Box display="flex">
            <ColorText color={`rarity${rarity}` as keyof Palette}>
              <StarRoundedIcon />
            </ColorText>
          </Box>
        </TableCell>

        <TableCell>
          <ElementIcon ele={element} iconProps={{ color: element }} />
        </TableCell>

        <TableCell>
          <ImgIcon
            src={imgAssets.weaponTypes?.[weaponType]}
            size={3}
            sideMargin
          />
        </TableCell>
      </TableRow>
    </Suspense>
  )
})
