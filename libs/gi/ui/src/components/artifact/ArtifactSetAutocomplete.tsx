import type { GeneralAutocompleteProps } from '@genshin-optimizer/common/ui'
import {
  GeneralAutocomplete,
  ImgIcon,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import type {
  ArtifactRarity,
  ArtifactSetKey,
} from '@genshin-optimizer/gi/consts'
import { setKeysByRarities } from '@genshin-optimizer/gi/util'
import type { AutocompleteRenderGroupParams } from '@mui/material'
import { Box, List, ListSubheader } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { sortByRarityAndName } from './artifactSortByRarityAndName'

export function ArtifactSetAutocomplete({
  artSetKey,
  setArtSetKey,
  label = '',
  ...props
}: {
  artSetKey: ArtifactSetKey | ''
  setArtSetKey: (key: ArtifactSetKey | '') => void
} & Omit<
  GeneralAutocompleteProps<ArtifactSetKey | ''>,
  'options' | 'valueKey' | 'onChange' | 'toImg' | 'groupBy' | 'renderGroup'
>) {
  const { t } = useTranslation(['artifact', 'artifactNames_gen'])
  label = label ? label : t('artifact:autocompleteLabels.set')

  const options = useMemo(
    () =>
      Object.entries(setKeysByRarities)
        .flatMap(([rarity, sets]) =>
          sets.map((set) => ({
            key: set,
            label: t(`artifactNames_gen:${set}`),
            grouper: +rarity as ArtifactRarity,
          })),
        )
        .sort(sortByRarityAndName),
    [t],
  )

  const toImg = useCallback(
    (key: ArtifactSetKey | '') =>
      key ? <ImgIcon src={artifactDefIcon(key)} size={2} /> : undefined,
    [],
  )
  const onChange = useCallback(
    (k: ArtifactSetKey | '' | null) => setArtSetKey(k ?? ''),
    [setArtSetKey],
  )
  return (
    <GeneralAutocomplete
      options={options}
      valueKey={artSetKey}
      onChange={onChange}
      toImg={toImg}
      label={label}
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
      {...props}
    />
  )
}
