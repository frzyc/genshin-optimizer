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
  setDiscSetKeys,
  totals,
}: {
  allowRarities?: DiscRarityKey[]
  discSetKeys: DiscSetKey[]
  setDiscSetKeys: (keys: DiscSetKey[]) => void
  totals: Record<DiscSetKey, string>
}) {
  const { t } = useTranslation(['disc', 'discNames_gen'])

  const toImg = useCallback(() => <ImgIcon src={''} size={3} />, [])
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
            label: t(`discNames_gen:${set}`),
          }))
        })
        .filter((group) => allowRarities.includes(group.grouper))
        .sort(),
    [allowRarities, t]
  )

  return (
    <GeneralAutocompleteMulti
      options={allDiscSetsAndRarities}
      valueKeys={discSetKeys}
      label={t('disc:autocompleteLabels.sets')}
      toImg={toImg}
      toExLabel={toExLabel}
      toExItemLabel={toExItemLabel}
      onChange={setDiscSetKeys}
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
