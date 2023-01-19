import { AutocompleteRenderGroupParams, Box, List, ListSubheader } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import usePromise from '../../ReactHooks/usePromise';
import { ArtifactRarity, ArtifactSetKey } from '../../Types/consts';
import { GeneralAutocomplete, GeneralAutocompleteProps } from '../GeneralAutocomplete';
import { StarsDisplay } from '../StarDisplay';
import sortByRarityAndName from './sortByRarityAndName';

export default function ArtifactSetAutocomplete({ artSetKey, setArtSetKey, label = "", ...props }: {
  artSetKey: ArtifactSetKey | ""
  setArtSetKey: (key: ArtifactSetKey | "") => void
} & Omit<GeneralAutocompleteProps<ArtifactSetKey | "">, "options" | "valueKey" | "onChange" | "toImg" | "groupBy" | "renderGroup">) {
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const { t } = useTranslation(["artifact", "artifactNames_gen"])
  label = label ? label : t("artifact:autocompleteLabels.set")

  const options = useMemo(() => !artifactSheets ? [] : Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets))
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, label: t(`artifactNames_gen:${set}`), grouper: +rarity as ArtifactRarity })))
    .sort(sortByRarityAndName), [artifactSheets, t])

  const toImg = useCallback((key: ArtifactSetKey | "") => key ? artifactSheets?.(key)?.defIcon : undefined, [artifactSheets])

  return <GeneralAutocomplete
    options={options}
    valueKey={artSetKey}
    onChange={k => setArtSetKey(k ?? "")}
    toImg={toImg}
    label={label}
    groupBy={(option) => option.grouper?.toString() ?? ""}
    renderGroup={(params: AutocompleteRenderGroupParams) => params.group && <List key={params.group} component={Box}>
      <ListSubheader key={`${params.group}Header`} sx={{ top: "-1em" }}>
        {params.group} <StarsDisplay stars={+params.group as ArtifactRarity} />
      </ListSubheader>
      {params.children}
    </List>}
    {...props}
  />
}
