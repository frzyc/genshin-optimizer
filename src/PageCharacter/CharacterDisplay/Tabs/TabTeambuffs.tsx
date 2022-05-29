import { PersonAdd } from "@mui/icons-material";
import { CardContent, CardHeader, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext, useMemo } from 'react';
import CardLight from "../../../Components/Card/CardLight";
import CharacterCard from "../../../Components/Character/CharacterCard";
import CharacterAutocomplete from "../../../Components/Character/CharacterAutocomplete";
import DocumentDisplay from "../../../Components/DocumentDisplay";
import { NodeFieldDisplay } from "../../../Components/FieldDisplay";
import InfoTooltip from "../../../Components/InfoTooltip";
import { ArtifactSheet } from "../../../Data/Artifacts/ArtifactSheet";
import { resonanceSheets } from "../../../Data/Resonance";
import { DataContext, dataContextObj } from "../../../DataContext";
import { uiInput as input } from "../../../Formula";
import { NodeDisplay } from "../../../Formula/uiData";
import useCharacterReducer from "../../../ReactHooks/useCharacterReducer";
import useCharSelectionCallback from "../../../ReactHooks/useCharSelectionCallback";
import usePromise from "../../../ReactHooks/usePromise";
import { ElementKey } from "../../../Types/consts";
import { objPathValue, range } from "../../../Util/Util";
import { useTranslation } from "react-i18next";

export default function TabTeambuffs() {
  return <Box display="flex" flexDirection="column" gap={1} alignItems="stretch">
    <Grid container spacing={1}>
      <Grid item xs={12} md={6} lg={3} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TeamBuffDisplay />
        <ResonanceDisplay />
      </Grid>
      {range(0, 2).map(i => <Grid item xs={12} md={6} lg={3} key={i}>
        <TeammateDisplay index={i} />
      </Grid>)}
    </Grid>
  </Box>
}
export function TeamBuffDisplay() {
  const { data, oldData } = useContext(DataContext)
  const teamBuffs = data.getTeamBuff()
  const nodes: Array<[string[], NodeDisplay<number>]> = []
  Object.entries(teamBuffs.total ?? {}).forEach(([key, node]) =>
    !node.isEmpty && node.value !== 0 && nodes.push([["total", key], node]))
  Object.entries(teamBuffs.premod ?? {}).forEach(([key, node]) =>
    !node.isEmpty && node.value !== 0 && nodes.push([["premod", key], node]))
  Object.entries(teamBuffs.enemy ?? {}).forEach(([key, node]) =>
    !node.isEmpty && node.value !== 0 && nodes.push([["enemy", key], node]))
  if (!nodes.length) return null
  return <CardLight>
    <CardContent>
      Team Buffs
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container>
        {nodes.map(([path, n], i) => n && <Grid item xs={12} key={n.info.key} >
          <NodeFieldDisplay node={n} oldValue={objPathValue(oldData?.getTeamBuff(), path)?.value} />
        </Grid>)}
      </Grid>
    </CardContent>
  </CardLight>
}
function ResonanceDisplay() {
  const { data } = useContext(DataContext)
  return <>
    {resonanceSheets.map((res, i) => {
      const icon = <InfoTooltip title={<Typography>{res.desc}</Typography>} />
      const title = <span>{res.name} {icon}</span>
      return <CardLight key={i} sx={{ opacity: res.canShow(data) ? 1 : 0.5, }}>
        <CardHeader title={title} action={res.icon} titleTypographyProps={{ variant: "subtitle2" }} />
        {res.canShow(data) && <Divider />}
        {res.canShow(data) && <CardContent>
          <DocumentDisplay sections={res.sections} teamBuffOnly hideDesc />
        </CardContent>}
      </CardLight>
    })}
  </>
}
function TeammateDisplay({ index }: { index: number }) {
  const dataContext = useContext(DataContext)
  const { t } = useTranslation("page_character")
  const { character: active, teamData, characterDispatch: activeCharacterDispatch } = dataContext
  const activeCharacterKey = active.key
  const characterKey = active.team[index]
  const characterDispatch = useCharacterReducer(characterKey)
  const onClickHandler = useCharSelectionCallback()

  const dataBundle = teamData[characterKey]
  const teamMateDataContext: dataContextObj | undefined = dataBundle && {
    character: dataBundle.character,
    characterSheet: dataBundle.characterSheet,
    data: dataBundle.target,
    teamData: teamData,
    mainStatAssumptionLevel: 0,
    characterDispatch
  }
  return <CardLight>
    <CardContent>
      <CharacterAutocomplete fullWidth value={characterKey}
        onChange={charKey => activeCharacterDispatch({ type: "team", index, charKey })}
        disable={ck => ck === activeCharacterKey || active.team.includes(ck)}
        labelText={t("teammate", { count: index + 1 })}
        defaultText={t("none")}
        defaultIcon={<PersonAdd />}
        showDefault
      />
    </CardContent>
    {teamMateDataContext && <DataContext.Provider value={teamMateDataContext}>
      <CharacterCard characterKey={characterKey}
        onClickHeader={onClickHandler}
        artifactChildren={<CharArtifactCondDisplay />}
        weaponChildren={<CharWeaponCondDisplay />}
        characterChildren={<CharTalentCondDisplay />}
        isTeammateCard
      />
    </DataContext.Provider>}
  </CardLight>

}
function CharArtifactCondDisplay() {
  const { data, } = useContext(DataContext)
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const sections = useMemo(() => artifactSheets &&
    Object.entries(ArtifactSheet.setEffects(artifactSheets, data))
      .flatMap(([setKey, setNums]) =>
        setNums.flatMap(sn => artifactSheets[setKey]!.setEffectDocument(sn)!))
    , [artifactSheets, data])
  if (!sections) return null
  return <DocumentDisplay sections={sections} teamBuffOnly={true} />
}
function CharWeaponCondDisplay() {
  const { teamData, character: { key: charKey } } = useContext(DataContext)
  const weaponSheet = teamData[charKey]!.weaponSheet
  if (!weaponSheet.document) return null
  return <DocumentDisplay sections={weaponSheet.document} teamBuffOnly={true} />
}
function CharTalentCondDisplay() {
  const { data, teamData, character: { key: charKey } } = useContext(DataContext)
  const characterSheet = teamData[charKey]!.characterSheet
  const talent = characterSheet.getTalent(data.get(input.charEle).value as ElementKey)!
  const sections = Object.values(talent.sheets).flatMap(sts => sts.sections)
  if (!sections) return null
  return <DocumentDisplay sections={sections} teamBuffOnly={true} />
}
