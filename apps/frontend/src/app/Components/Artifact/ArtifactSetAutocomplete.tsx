import { ArtifactSetKey } from '@genshin-optimizer/consts';
import { AutocompleteRenderGroupParams, Box, List, ListSubheader } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setKeysByRarities } from '../../Data/Artifacts';
import { artifactDefIcon } from '../../Data/Artifacts/ArtifactSheet';
import { ArtifactRarity } from '../../Types/consts';
import { GeneralAutocomplete, GeneralAutocompleteProps } from '../GeneralAutocomplete';
import ImgIcon from '../Image/ImgIcon';
import { StarsDisplay } from '../StarDisplay';
import sortByRarityAndName from './sortByRarityAndName';

export default function ArtifactSetAutocomplete({ artSetKey, setArtSetKey, label = "", ...props }: {
  artSetKey: ArtifactSetKey | ""
  setArtSetKey: (key: ArtifactSetKey | "") => void
} & Omit<GeneralAutocompleteProps<ArtifactSetKey | "">, "options" | "valueKey" | "onChange" | "toImg" | "groupBy" | "renderGroup">) {
  const { t } = useTranslation(["artifact", "artifactNames_gen"])
  label = label ? label : t("artifact:autocompleteLabels.set")

  const options = useMemo(() => Object.entries(setKeysByRarities)
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, label: t(`artifactNames_gen:${set}`), grouper: +rarity as ArtifactRarity })))
    .sort(sortByRarityAndName), [t])

  const toImg = useCallback((key: ArtifactSetKey | "") => key ? <ImgIcon src={artifactDefIcon(key)} sx={{ fontSize: "1.5em" }} /> : undefined, [])

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
