import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ColorText, ImgIcon } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  allCharacterKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { i18n } from '@genshin-optimizer/gi/i18n'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import { CharacterName, iconAsset } from '@genshin-optimizer/gi/ui'
import { SillyContext } from '@genshin-optimizer/gi/uidata'
import SearchIcon from '@mui/icons-material/Search'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import type { Palette } from '@mui/material'
import {
  Box,
  CardContent,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { memo, useContext, useDeferredValue, useMemo, useState } from 'react'
import { CharacterView } from './CharacterView'
const rarties = [5, 4] as const
export default function TabCharacter() {
  const { silly } = useContext(SillyContext)
  const [rarityFilter, setRarityFilter] = useState([...rarties])
  const [weaponTypeFilter, setWeaponTypeFilter] = useState([
    ...allWeaponTypeKeys,
  ])
  const handleRarity = handleMultiSelect([...rarties])
  const handleType = handleMultiSelect([...allWeaponTypeKeys])
  const [searchTerm, setSearchTerm] = useState('')
  const searchTermDeferred = useDeferredValue(searchTerm)
  const weaponKeys = useMemo(() => {
    return allCharacterKeys.filter(
      (cKey) => {
        const { rarity, weaponType } = getCharStat(cKey)
        if (!rarityFilter.includes(rarity as (typeof rarties)[number]))
          return false
        if (!weaponTypeFilter.includes(weaponType)) return false

        const nameStr = i18n.t(`charNames_gen:${cKey}`)
        const sillyStr =
          silly && i18n.exists(`sillyWisher_charNames:${cKey}`)
            ? i18n.t(`sillyWisher_charNames:${cKey}`)
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
      },
      [rarityFilter]
    )
  }, [rarityFilter, searchTermDeferred, silly, weaponTypeFilter])
  return (
    <Box>
      <CardContent sx={{ display: 'flex', gap: 2 }}>
        <ToggleButtonGroup value={rarityFilter}>
          {rarties.map((r) => (
            <ToggleButton
              key={r}
              value={r}
              onClick={() => setRarityFilter((old) => handleRarity(old, r))}
            >
              <ColorText color={`rarity${r}` as keyof Palette}>
                <StarRoundedIcon sx={{ verticalAlign: 'text-top' }} />
              </ColorText>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup value={weaponTypeFilter}>
          {allWeaponTypeKeys.map((wt) => (
            <ToggleButton
              key={wt}
              value={wt}
              onClick={() => setWeaponTypeFilter((old) => handleType(old, wt))}
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
            <TableCell>Name</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>Element</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {weaponKeys.map((wKey) => (
            <CharacterRow key={wKey} characterKey={wKey} />
          ))}
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
      } as ICachedCharacter),
    [cKey]
  )
  return (
    <>
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
    </>
  )
})
