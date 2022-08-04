import { PersonAdd } from "@mui/icons-material";
import { CardContent, CardHeader, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useContext, useMemo } from 'react';
import { useTranslation } from "react-i18next";
import CardLight from "../../../Components/Card/CardLight";
import CharacterAutocomplete from "../../../Components/Character/CharacterAutocomplete";
import CharacterCard from "../../../Components/Character/CharacterCard";
import DocumentDisplay from "../../../Components/DocumentDisplay";
import { NodeFieldDisplay } from "../../../Components/FieldDisplay";
import InfoTooltip from "../../../Components/InfoTooltip";
import { CharacterContext, CharacterContextObj } from "../../../Context/CharacterContext";
import { DataContext, dataContextObj } from "../../../Context/DataContext";
import { ArtifactSheet } from "../../../Data/Artifacts/ArtifactSheet";
import { resonanceSheets } from "../../../Data/Resonance";
import { uiInput as input } from "../../../Formula";
import { NodeDisplay } from "../../../Formula/uiData";
import useCharSelectionCallback from "../../../ReactHooks/useCharSelectionCallback";
import usePromise from "../../../ReactHooks/usePromise";
import { ElementKey } from "../../../Types/consts";
import { objPathValue, range } from "../../../Util/Util";

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
    !node.isEmpty && typeof node.value === "number" && node.value !== 0 && nodes.push([["enemy", key], node as NodeDisplay<number>]))
  if (!nodes.length) return null
  return <CardLight>
    <CardContent>
      <Typography>Team Buffs</Typography>
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
  const { teamData } = useContext(DataContext)
  const { t } = useTranslation("page_character")
  const { character: active, character: { key: activeCharacterKey }, characterDispatch } = useContext(CharacterContext)
  const teamMateKey = active.team[index]
  const onClickHandler = useCharSelectionCallback()

  const dataBundle = teamData[teamMateKey]
  const teammateCharacterContext: CharacterContextObj | undefined = useMemo(() => dataBundle && {
    character: { ...dataBundle.character, conditional: active.teamConditional[teamMateKey] ?? {} },
    characterSheet: dataBundle.characterSheet,
    characterDispatch: (state) => {
      if (!teamMateKey) return
      if (!("conditional" in state)) return
      const { conditional } = state
      characterDispatch({ type: "teamConditional", teamMateKey: teamMateKey, conditional })
    }
  }, [active, teamMateKey, dataBundle, characterDispatch])
  const teamMateDataContext: dataContextObj | undefined = useMemo(() => dataBundle && {
    data: dataBundle.target,
    teamData: teamData,
  }, [dataBundle, teamData])
  return <CardLight>
    <CharacterAutocomplete fullWidth value={teamMateKey}
      onChange={charKey => characterDispatch({ type: "team", index, charKey })}
      disable={ck => ck === activeCharacterKey || (ck !== "" && active.team.includes(ck))}
      labelText={t("teammate", { count: index + 1 })}
      defaultText={t("none")}
      defaultIcon={<PersonAdd />}
      showDefault
    />
    {teammateCharacterContext && <CharacterContext.Provider value={teammateCharacterContext}>
      {teamMateDataContext && <DataContext.Provider value={teamMateDataContext}>
        <CharacterCard characterKey={teamMateKey}
          onClickHeader={onClickHandler}
          // Need to wrap these elements with the providers for them to use the correct functions.
          artifactChildren={<CharacterContext.Provider value={teammateCharacterContext}>
            <DataContext.Provider value={teamMateDataContext}>
              <CharArtifactCondDisplay />
            </DataContext.Provider>
          </CharacterContext.Provider>}
          weaponChildren={<CharacterContext.Provider value={teammateCharacterContext}>
            <DataContext.Provider value={teamMateDataContext}>
              <CharWeaponCondDisplay />
            </DataContext.Provider>
          </CharacterContext.Provider>}
          characterChildren={<CharacterContext.Provider value={teammateCharacterContext}>
            <DataContext.Provider value={teamMateDataContext}>
              <CharTalentCondDisplay />
            </DataContext.Provider>
          </CharacterContext.Provider>}
          isTeammateCard
        />
      </DataContext.Provider>}
    </CharacterContext.Provider>}
  </CardLight>
}
function CharArtifactCondDisplay() {
  const { data, } = useContext(DataContext)
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const sections = useMemo(() => artifactSheets &&
    Object.entries(ArtifactSheet.setEffects(artifactSheets, data))
      .flatMap(([setKey, setNums]) =>
        setNums.flatMap(sn => artifactSheets[setKey]!.setEffectDocument(sn)!))
    , [artifactSheets, data])
  if (!sections) return null
  return <DocumentDisplay sections={sections} teamBuffOnly={true} />
}
function CharWeaponCondDisplay() {
  const { character: { key: charKey } } = useContext(CharacterContext)
  const { teamData } = useContext(DataContext)
  const weaponSheet = teamData[charKey]!.weaponSheet
  if (!weaponSheet.document) return null
  return <DocumentDisplay sections={weaponSheet.document} teamBuffOnly={true} />
}
function CharTalentCondDisplay() {
  const { character: { key: charKey } } = useContext(CharacterContext)
  const { data, teamData } = useContext(DataContext)
  const characterSheet = teamData[charKey]!.characterSheet
  const talent = characterSheet.getTalent(data.get(input.charEle).value as ElementKey)!
  const sections = Object.values(talent.sheets).flatMap(sts => sts.sections)
  if (!sections) return null
  return <DocumentDisplay sections={sections} teamBuffOnly={true} />
}
