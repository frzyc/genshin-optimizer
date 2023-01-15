import { AutocompleteRenderGroupParams, Box, Chip, List, ListSubheader } from "@mui/material"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet"
import usePromise from "../../ReactHooks/usePromise"
import { ArtifactRarity, ArtifactSetKey } from "../../Types/consts"
import { GeneralAutocompleteMulti } from "../GeneralAutocomplete"
import { StarsDisplay } from "../StarDisplay"
import sortByRarityAndName from "./sortByRarityAndName"

export default function ArtifactSetMultiAutocomplete({ artSetKeys, setArtSetKeys, totals }: {
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void,
  totals: Record<ArtifactSetKey, string>
}) {
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const { t } = useTranslation(["artifact", "artifactNames_gen"])

  const toImg = useCallback(
    (key: ArtifactSetKey) => artifactSheets?.(key).defIcon,
    [artifactSheets],
  )
  const toExLabel = useCallback((key: ArtifactSetKey) => <strong>{totals[key]}</strong>, [totals],)
  const toExItemLabel = useCallback((key: ArtifactSetKey) => <Chip size="small" label={totals[key]} />, [totals],)

  const allArtifactSetsAndRarities = useMemo(() => !artifactSheets ? [] : Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets))
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, grouper: +rarity as ArtifactRarity, label: t(`artifactNames_gen:${set}`) })))
    .sort(sortByRarityAndName), [artifactSheets, t])

  return <GeneralAutocompleteMulti
    options={allArtifactSetsAndRarities}
    valueKeys={artSetKeys}
    label={t("artifact:autocompleteLabels.sets")}
    toImg={toImg}
    toExLabel={toExLabel}
    toExItemLabel={toExItemLabel}
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
