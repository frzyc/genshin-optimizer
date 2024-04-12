import { ColorText, ImgIcon, useInfScroll } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import { Translate, i18n } from '@genshin-optimizer/gi/i18n'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { ArtifactSetName } from '@genshin-optimizer/gi/ui'
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
} from '@mui/material'
import { Suspense, useDeferredValue, useMemo, useState } from 'react'
const maxRarities = [5, 4, 3] as const
export default function TabArtifact() {
  const [rarityFilter, setRarityFilter] = useState([...maxRarities])
  const [searchTerm, setSearchTerm] = useState('')
  const searchTermDeferred = useDeferredValue(searchTerm)
  const handleRarity = handleMultiSelect([...maxRarities])
  const artSetKeys = useMemo(() => {
    return allArtifactSetKeys.filter(
      (setKey) => {
        const { rarities } = getArtSetStat(setKey)
        if (
          !rarityFilter.includes(
            Math.max(...rarities) as (typeof maxRarities)[number]
          )
        )
          return false
        const setKeyStr = i18n.t(`artifactNames_gen:${setKey}`)
        if (
          searchTermDeferred &&
          !setKeyStr
            .toLocaleLowerCase()
            .includes(searchTermDeferred.toLocaleLowerCase())
        )
          return false
        return true
      },
      [rarityFilter]
    )
  }, [rarityFilter, searchTermDeferred])
  const artSetKeysWithoutPrayer = useMemo(
    () => artSetKeys.filter((sk) => !sk.startsWith('Prayers')),
    [artSetKeys]
  )
  const { numShow, setTriggerElement } = useInfScroll(
    10,
    artSetKeysWithoutPrayer.length
  )
  const artSetKeysToShow = useMemo(
    () => artSetKeysWithoutPrayer.slice(0, numShow),
    [artSetKeysWithoutPrayer, numShow]
  )
  return (
    <Box>
      <CardContent sx={{ display: 'flex', gap: 2 }}>
        <ToggleButtonGroup value={rarityFilter}>
          {maxRarities.map((r) => (
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
            <TableCell>Set</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>2-piece Bonus</TableCell>
            <TableCell>4-piece Bonus</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {artSetKeysToShow.map((setKey) => {
            const { rarities } = getArtSetStat(setKey)
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
                <TableRow key={setKey}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ImgIcon size={4} src={artifactDefIcon(setKey)} />
                      <ArtifactSetName setKey={setKey} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      {rarities
                        .sort()
                        .reverse()
                        .map((r) => (
                          <ColorText
                            color={`rarity${r}` as keyof Palette}
                            key={r}
                          >
                            <StarRoundedIcon />
                          </ColorText>
                        ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Translate
                      ns={`artifact_${setKey}_gen`}
                      key18={`setEffects.2`}
                    />
                  </TableCell>
                  <TableCell>
                    <Translate
                      ns={`artifact_${setKey}_gen`}
                      key18={`setEffects.4`}
                    />
                  </TableCell>
                </TableRow>
              </Suspense>
            )
          })}
          {artSetKeysWithoutPrayer.length !== artSetKeysToShow.length && (
            <TableRow>
              <TableCell colSpan={4}>
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
      {/* Table for Prayers pieces */}
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Set</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>1-piece Bonus</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {artSetKeys
            .filter((sk) => sk.startsWith('Prayers'))
            .map((setKey) => {
              const { rarities } = getArtSetStat(setKey)
              return (
                <TableRow key={setKey}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ImgIcon size={4} src={artifactDefIcon(setKey)} />
                      <ArtifactSetName setKey={setKey} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      {rarities
                        .sort()
                        .reverse()
                        .map((r) => (
                          <ColorText
                            color={`rarity${r}` as keyof Palette}
                            key={r}
                          >
                            <StarRoundedIcon />
                          </ColorText>
                        ))}
                    </Box>
                  </TableCell>
                  <TableCell width="90%">
                    <Translate
                      ns={`artifact_${setKey}_gen`}
                      key18={`setEffects.1`}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          {/* TODO: prayer table? */}
        </TableBody>
      </Table>
    </Box>
  )
}
