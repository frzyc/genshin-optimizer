import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ColorText, ImgIcon, useInfScroll } from '@genshin-optimizer/common/ui'
import { catTotal, handleMultiSelect } from '@genshin-optimizer/common/util'
import { imgAssets, weaponAsset } from '@genshin-optimizer/gi/assets'
import type { WeaponKey, WeaponSubstatKey } from '@genshin-optimizer/gi/consts'
import {
  allWeaponKeys,
  allWeaponSubstatKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type {
  ArchiveWeaponOption,
  ICachedWeapon,
} from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { i18n } from '@genshin-optimizer/gi/i18n'
import { getWeaponSheet } from '@genshin-optimizer/gi/sheets'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  SubstatMultiAutocomplete,
  WeaponName,
  getCalcDisplay,
  resolveInfo,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { computeUIData } from '@genshin-optimizer/gi/uidata'
import { dataObjForWeapon, input } from '@genshin-optimizer/gi/wr'
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import {
  Suspense,
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { WeaponView } from './WeaponView'
const rarities = [5, 4, 3, 2, 1] as const
export default function TabWeapon() {
  const database = useDatabase()
  const archive = useDataEntryBase(database.displayArchive)
  const handleRarity = handleMultiSelect([...rarities])
  const handleType = handleMultiSelect([...allWeaponTypeKeys])
  const [searchTerm, setSearchTerm] = useState('')
  const searchTermDeferred = useDeferredValue(searchTerm)
  const { weapon } = archive
  const weaponOptionDispatch = useCallback(
    (option: Partial<ArchiveWeaponOption>) =>
      database.displayArchive.set({ weapon: { ...weapon, ...option } }),
    [database, weapon]
  )
  const weaponKeys = useMemo(() => {
    return allWeaponKeys.filter((wKey) => {
      const { rarity, subStat, weaponType } = getWeaponStat(wKey)
      if (!weapon.rarity.includes(rarity)) return false
      if (
        weapon.subStat.length &&
        (!subStat || !weapon.subStat.includes(subStat.type as WeaponSubstatKey))
      )
        return false
      if (!weapon.weaponType.includes(weaponType)) return false
      const setKeyStr = i18n.t(`weaponNames_gen:${wKey}`)
      if (
        searchTermDeferred &&
        !setKeyStr
          .toLocaleLowerCase()
          .includes(searchTermDeferred.toLocaleLowerCase())
      )
        return false
      return true
    })
  }, [weapon, searchTermDeferred])
  const { numShow, setTriggerElement } = useInfScroll(10, weaponKeys.length)
  const weaponKeysToShow = useMemo(
    () => weaponKeys.slice(0, numShow),
    [weaponKeys, numShow]
  )
  const weaponTotals = useMemo(
    () =>
      catTotal(allWeaponSubstatKeys, (ct) =>
        allWeaponKeys.forEach((wKey) => {
          const { subStat } = getWeaponStat(wKey)
          if (!subStat) return
          const { type } = subStat as { type: WeaponSubstatKey }
          ct[type].total++
          if (weaponKeys.includes(wKey)) ct[type].current++
        })
      ),
    [weaponKeys]
  )
  return (
    <Box>
      <CardContent sx={{ display: 'flex', gap: 2 }}>
        <ToggleButtonGroup value={weapon.rarity}>
          {rarities.map((r) => (
            <ToggleButton
              key={r}
              value={r}
              onClick={() =>
                weaponOptionDispatch({ rarity: handleRarity(weapon.rarity, r) })
              }
            >
              <ColorText color={`rarity${r}` as keyof Palette}>
                <StarRoundedIcon sx={{ verticalAlign: 'text-top' }} />
              </ColorText>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup value={weapon.weaponType}>
          {allWeaponTypeKeys.map((wt) => (
            <ToggleButton
              key={wt}
              value={wt}
              onClick={() =>
                weaponOptionDispatch({
                  weaponType: handleType(weapon.weaponType, wt),
                })
              }
            >
              <ImgIcon src={imgAssets.weaponTypes?.[wt]} size={2} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <SubstatMultiAutocomplete
          fullWidth
          substatKeys={weapon.subStat}
          setSubstatKeys={(subStat) => {
            weaponOptionDispatch({ subStat: subStat })
          }}
          totals={weaponTotals}
          allSubstatKeys={[...allWeaponSubstatKeys]}
        />
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
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>Main</TableCell>
            <TableCell>Secondary</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {weaponKeysToShow.map((wKey) => (
            <WeaponRow key={wKey} weaponKey={wKey} />
          ))}
          {weaponKeys.length !== weaponKeysToShow.length && (
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
const WeaponRow = memo(function WeaponRow({
  weaponKey: wKey,
}: {
  weaponKey: WeaponKey
}) {
  const [show, onShow, onHide] = useBoolState()
  const { rarity, weaponType } = getWeaponStat(wKey)
  const weapon = useMemo(
    () =>
      ({
        id: 'invalid',
        ascension: rarity > 2 ? 6 : 4,
        key: wKey,
        level: rarity > 2 ? 90 : 70,
        refinement: 1,
        location: '',
        lock: false,
      } as ICachedWeapon),
    [rarity, wKey]
  )
  const weaponUIData = useMemo(
    () => computeUIData([getWeaponSheet(wKey).data, dataObjForWeapon(weapon)]),
    [wKey, weapon]
  )
  const main = weaponUIData.get(input.weapon.main)
  const sub = weaponUIData.get(input.weapon.sub)
  return (
    <Suspense
      fallback={
        <TableRow>
          <TableCell colSpan={5}>
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
      <WeaponView
        show={show}
        weaponUIData={weaponUIData}
        weapon={weapon}
        onClose={onHide}
      />
      <TableRow hover onClick={onShow} sx={{ cursor: 'pointer' }}>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ImgIcon size={4} src={weaponAsset(wKey, true)} />
            <WeaponName weaponKey={wKey} />
          </Box>
        </TableCell>
        <TableCell>
          <ImgIcon
            src={imgAssets.weaponTypes?.[weaponType]}
            size={3}
            sideMargin
          />
        </TableCell>
        <TableCell>
          <Box display="flex">
            <ColorText color={`rarity${rarity}` as keyof Palette}>
              <StarRoundedIcon />
            </ColorText>
          </Box>
        </TableCell>
        <TableCell>
          <StatDisplay node={main} />
        </TableCell>
        <TableCell>
          <StatDisplay node={sub} />
        </TableCell>
      </TableRow>
    </Suspense>
  )
})
function StatDisplay({ node }: { node: CalcResult }) {
  const { name, icon } = resolveInfo(node.info)
  if (Number.isNaN(node.value)) return null
  return (
    <Box sx={{ display: 'flex' }}>
      <Typography flexGrow={1}>
        {icon} {name}
      </Typography>
      <Typography>{getCalcDisplay(node).valueString}</Typography>
    </Box>
  )
}
