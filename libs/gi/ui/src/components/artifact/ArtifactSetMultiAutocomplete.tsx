import {
  GeneralAutocompleteMulti,
  ImgIcon,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import {
  allArtifactRarityKeys,
  type ArtifactRarity,
  type ArtifactSetKey,
} from '@genshin-optimizer/gi/consts'
import { setKeysByRarities } from '@genshin-optimizer/gi/util'
import type { AutocompleteRenderGroupParams } from '@mui/material'
import { Box, Chip, List, ListSubheader } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { sortByRarityAndName } from './artifactSortByRarityAndName'

export function ArtifactSetMultiAutocomplete({
  allowRarities = [...allArtifactRarityKeys],
  artSetKeys,
  setArtSetKeys,
  totals,
}: {
  allowRarities?: ArtifactRarity[]
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void
  totals: Record<ArtifactSetKey, string>
}) {
  const { t } = useTranslation(['artifact', 'artifactNames_gen'])

  const toImg = useCallback(
    (key: ArtifactSetKey) => <ImgIcon src={artifactDefIcon(key)} size={3} />,
    [],
  )
  const toExLabel = useCallback(
    (key: ArtifactSetKey) => <strong>{totals[key]}</strong>,
    [totals],
  )
  const toExItemLabel = useCallback(
    (key: ArtifactSetKey) => <Chip size="small" label={totals[key]} />,
    [totals],
  )

  const allArtifactSetsAndRarities = useMemo(
    () =>
      Object.entries(setKeysByRarities)
        .flatMap(([rarity, sets]) =>
          sets.map((set) => ({
            key: set,
            grouper: +rarity as ArtifactRarity,
            label: t(`artifactNames_gen:${set}`),
          })),
        )
        .filter((group) => allowRarities.includes(group.grouper))
        .sort(sortByRarityAndName),
    [t, allowRarities],
  )

  return (
    <GeneralAutocompleteMulti
      options={allArtifactSetsAndRarities}
      valueKeys={artSetKeys}
      label={t('artifact:autocompleteLabels.sets')}
      toImg={toImg}
      toExLabel={toExLabel}
      toExItemLabel={toExItemLabel}
      onChange={setArtSetKeys}
      groupBy={(option) => option.grouper?.toString() ?? ''}
      renderGroup={(params: AutocompleteRenderGroupParams) =>
        params.group && (
          <List key={params.group} component={Box}>
            <ListSubheader key={`${params.group}Header`} sx={{ top: '-1em' }}>
              {params.group}{' '}
              <StarsDisplay stars={+params.group as ArtifactRarity} inline />
            </ListSubheader>
            {params.children}
          </List>
        )
      }
    />
  )
}
