import { ArtifactSetKey } from "@genshin-optimizer/consts"
import { AutocompleteRenderGroupParams, Box, Chip, List, ListSubheader } from "@mui/material"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { setKeysByRarities } from "../../Data/Artifacts"
import { artifactDefIcon } from "../../Data/Artifacts/ArtifactSheet"
import { ArtifactRarity } from "../../Types/consts"
import { GeneralAutocompleteMulti } from "../GeneralAutocomplete"
import ImgIcon from "../Image/ImgIcon"
import { StarsDisplay } from "../StarDisplay"
import sortByRarityAndName from "./sortByRarityAndName"

export default function ArtifactSetMultiAutocomplete({ artSetKeys, setArtSetKeys, totals }: {
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void,
  totals: Record<ArtifactSetKey, string>
}) {
  const { t } = useTranslation(["artifact", "artifactNames_gen"])

  const toImg = useCallback((key: ArtifactSetKey) => <ImgIcon src={artifactDefIcon(key)} sx={{ fontSize: "1.5em" }} />, [])
  const toExLabel = useCallback((key: ArtifactSetKey) => <strong>{totals[key]}</strong>, [totals],)
  const toExItemLabel = useCallback((key: ArtifactSetKey) => <Chip size="small" label={totals[key]} />, [totals],)

  const allArtifactSetsAndRarities = useMemo(() => Object.entries(setKeysByRarities)
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, grouper: +rarity as ArtifactRarity, label: t(`artifactNames_gen:${set}`) })))
    .sort(sortByRarityAndName), [t])

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
        {params.group} <StarsDisplay stars={+params.group as ArtifactRarity} inline />
      </ListSubheader>
      {params.children}
    </List>}
  />
}
