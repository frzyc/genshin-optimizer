import {
  allArtifactSetKeys,
  type ArtifactRarity,
  type ArtifactSetKey,
} from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import type { GeneralAutocompleteProps } from '@genshin-optimizer/ui-common'
import { GeneralAutocomplete, StarsDisplay } from '@genshin-optimizer/ui-common'
import type { AutocompleteRenderGroupParams } from '@mui/material'
import { Box, List, ListSubheader } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { artifactDefIcon } from '../artifactUtil'
import { ImageIcon } from '../ImageIcon'
import { assetWrapper } from '../util'

export default function ArtifactSetAutocomplete({
  artSetKey,
  setArtSetKey,
  label = '',
  ...props
}: {
  artSetKey: ArtifactSetKey | null
  setArtSetKey: (key: ArtifactSetKey | null) => void
} & Omit<
  GeneralAutocompleteProps<ArtifactSetKey>,
  'options' | 'valueKey' | 'onChange' | 'toImg' | 'groupBy' | 'renderGroup'
>) {
  const { t } = useTranslation(['artifact', 'artifactNames_gen'])
  label = label ? label : t('artifact:autocompleteLabels.set')

  const options = useMemo(
    () =>
      allArtifactSetKeys
        .map((set) => ({
          key: set,
          label: t(`artifactNames_gen:${set}`),
          grouper: Math.max(...allStats.art.data[set].rarities),
        }))
        .sort((a, b) => {
          if (a.grouper > b.grouper) return -1
          if (a.grouper < b.grouper) return 1
          if (a.label < b.label) return -1
          if (a.label > b.label) return 1
          return 0
        }),
    [t]
  )

  const toImg = useCallback(
    (key: ArtifactSetKey | null) =>
      key ? (
        <ImageIcon src={assetWrapper(artifactDefIcon(key))} size={2} />
      ) : undefined,
    []
  )
  const onChange = useCallback(
    (k: ArtifactSetKey | null) => setArtSetKey(k),
    [setArtSetKey]
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
