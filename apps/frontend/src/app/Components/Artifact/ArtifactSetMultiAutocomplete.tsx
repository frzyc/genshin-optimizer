import { AutocompleteRenderGroupParams, Box, List, ListSubheader } from "@mui/material"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactRarity, ArtifactSetKey } from "../../Types/consts"
import { GeneralAutocompleteMulti } from "../GeneralAutocomplete"
import { StarsDisplay } from "../StarDisplay"
import sortByRarityAndName from "./sortByRarityAndName"

export default function ArtifactSetMultiAutocomplete({ artSetKeys, setArtSetKeys }: {
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void
}) {
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const { t } = useTranslation(["artifact", "artifactNames_gen"])

  const toImg = useCallback(
    (key: ArtifactSetKey) => artifactSheets?.(key).defIcon,
    [artifactSheets],
  )

  const allArtifactSetsAndRarities = useMemo(() => !artifactSheets ? [] : Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets))
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, grouper: +rarity as ArtifactRarity, label: t(`artifactNames_gen:${set}`) })))
    .sort(sortByRarityAndName), [artifactSheets, t])

  return <GeneralAutocompleteMulti
    options={allArtifactSetsAndRarities}
    valueKeys={artSetKeys}
    label={t("artifact:autocompleteLabels.sets")}
    toImg={toImg}
    onChange={setArtSetKeys}
    groupBy={(option) => option.grouper?.toString() ?? ""}
    renderGroup={(params: AutocompleteRenderGroupParams) => params.group && <List key={params.group} component={Box}>
      <ListSubheader key={`${params.group}Header`} sx={{ top: "-1em" }}>
        {params.group} <StarsDisplay stars={+params.group as ArtifactRarity} />
      </ListSubheader>
      {params.children}
    </List>}
  />
}
