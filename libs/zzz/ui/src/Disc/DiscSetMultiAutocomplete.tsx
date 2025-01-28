import { GeneralAutocompleteMulti, ImgIcon } from '@genshin-optimizer/common/ui'
import type { DiscRarityKey, DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allDiscRarityKeys } from '@genshin-optimizer/zzz/consts'
import { setKeysByRarities } from '@genshin-optimizer/zzz/util'
import type { AutocompleteRenderGroupParams } from '@mui/material'
import { Box, Chip, List, ListSubheader } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function DiscSetMultiAutocomplete({
  allowRarities = [...allDiscRarityKeys],
  discSetKeys,
  setArtSetKeys,
  totals,
}: {
  allowRarities?: DiscRarityKey[]
  discSetKeys: DiscSetKey[]
  setArtSetKeys: (keys: DiscSetKey[]) => void
  totals: Record<DiscSetKey, string>
}) {
  const { t } = useTranslation(['artifact', 'artifactNames_gen'])

  const toImg = useCallback(
    (key: DiscSetKey) => <ImgIcon src={''} size={3} />,
    []
  )
  const toExLabel = useCallback(
    (key: DiscSetKey) => <strong>{totals[key]}</strong>,
    [totals]
  )
  const toExItemLabel = useCallback(
    (key: DiscSetKey) => <Chip size="small" label={totals[key]} />,
    [totals]
  )

  const allDiscSetsAndRarities = useMemo(
    () =>
      Object.entries(setKeysByRarities)
        .flatMap(([rarity, sets]) => {
          return sets.map((set) => ({
            key: set,
            grouper: rarity as DiscRarityKey,
            label: set,
          }))
        })
        .filter((group) => allowRarities.includes(group.grouper))
        .sort(),
    [allowRarities]
  )

  return (
    <GeneralAutocompleteMulti
      options={allDiscSetsAndRarities}
      valueKeys={discSetKeys}
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
              {params.group}
            </ListSubheader>
            {params.children}
          </List>
        )
      }
    />
  )
}
