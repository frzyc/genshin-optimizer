import { PersonAdd } from "@mui/icons-material";
import { CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext } from 'react';
import CardDark from "../../Components/Card/CardDark";
import CardLight from "../../Components/Card/CardLight";
import CharacterDropdownButton from "../../Components/Character/CharacterDropdownButton";
import { NodeFieldDisplay } from "../../Components/FieldDisplay";
import resonanceSheets from "../../Conditional/Resonance";
import { DataContext, dataContextObj } from "../../DataContext";
import { input } from "../../Formula";
import { NumNode } from "../../Formula/type";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import useCharSelectionCallback from "../../ReactHooks/useCharSelectionCallback";
import useCharUIData from "../../ReactHooks/useCharUIData";
import { range } from "../../Util/Util";
import CharacterCard from "../CharacterCard";

export default function CharacterTeamBuffsPane() {
  return <Box display="flex" flexDirection="column" gap={1} alignItems="stretch">
    <TeamBuffDisplay />
    {/* <ResonanceDisplay characterKey={characterKey} build={build} /> */}
    <Grid container spacing={1}>
      {range(0, 2).map(i => <Grid item xs={12} md={6} lg={4} key={i}>
        <TeammateDisplay index={i} />
      </Grid>)}
    </Grid>
  </Box>
}
const statBreakpoint = {
  xs: 12, sm: 6, md: 6, lg: 4,
} as const
export function TeamBuffDisplay() {
  const { data, oldData, character } = useContext(DataContext)
  const bonusStatsKeys = Object.keys(character?.bonusStats)
  if (!bonusStatsKeys.length) return null
  const nodes = bonusStatsKeys.map(k => data.get(input.total[k] as NumNode))
  const oldValues = oldData && bonusStatsKeys.map(k => oldData.get(input.total[k] as NumNode).value)

  if (!nodes.length) return null
  return <CardLight>
    <CardContent>
      Team Buffs
    </CardContent>
    <Divider />
    <CardContent>
      {/* TODO: */}
      This isnt team buffs, but bonusStats. so... TODO
      <Grid container columnSpacing={2} rowSpacing={1}>
        {nodes.map((n, i) => <Grid item {...statBreakpoint} key={i} ><NodeFieldDisplay node={n} oldValue={oldValues?.[i]} /></Grid>)}
      </Grid>
    </CardContent>
  </CardLight>
}
function ResonanceDisplay() {
  const { data, characterDispatch } = useContext(DataContext)
  return <CardLight>
    <CardContent>
      Team Resonance
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container spacing={1}>
        {/* {resonanceSheets.map((doc, i) =>
          <Grid item key={i} xs={12} md={6} lg={4} >
            <CardDark sx={{ opacity: doc.canShow(build) ? 1 : 0.5, height: "100%" }}>
              <CardHeader avatar={doc?.header?.icon} title={doc?.header?.title} action={doc?.header?.action} titleTypographyProps={{ variant: "subtitle2" }} />
              <Divider />
              <CardContent>
                {doc.description}
              </CardContent>
              {doc.conditionals.map(cond =>
                <ConditionalDisplay key={cond.key} conditional={cond} stats={build} onChange={val => characterDispatch({ conditionalValues: val })} />
              )}
            </CardDark>
          </Grid>
        )} */}
      </Grid>
    </CardContent>
  </CardLight>
}
function TeammateDisplay({ index }: { index: number }) {
  const { character: active } = useContext(DataContext)
  const characterKey = active.team[index]
  const characterDispatch = useCharacterReducer(characterKey)
  // TODO: this UIData should be fed from the main CharacterDisplayCard for teams.
  const dataBundle = useCharUIData(characterKey)
  const onClickHandler = useCharSelectionCallback()
  const dataContext: dataContextObj | undefined = dataBundle && characterDispatch && {
    character: dataBundle.character,
    characterSheet: dataBundle.characterSheet,
    data: dataBundle.data,
    mainStatAssumptionLevel: 0,
    characterDispatch
  }
  return <CardLight>
    <CardContent>
      <CharacterDropdownButton fullWidth value={characterKey}
        onChange={charKey => characterDispatch({ type: "team", index, charKey })}
        filter={(_, ck) => ck !== characterKey && !active.team.includes(ck)} unSelectText={`Teammate ${index + 1}`} unSelectIcon={<PersonAdd />} />
    </CardContent>
    {dataContext && <DataContext.Provider value={dataContext}>
      <CharacterCard characterKey={characterKey}
        onClickHeader={onClickHandler}
        // TODO: funnel build to CharacterCard? since these builds will have buffs?
        // build={condCharStats}
        artifactChildren={<CharArtifactCondDisplay />}
        weaponChildren={<CharWeaponCondDisplay />}
        footer={<CharTalentCondDisplay />}
      />
    </DataContext.Provider>}
  </CardLight>

}
function CharArtifactCondDisplay() {
  const { data, characterDispatch } = useContext(DataContext)
  return <Box >
    {/* {Object.entries(condCharStats.setToSlots).map(([artSetKey, slotkeys]) =>
      Object.entries(Conditional.partyConditionals?.artifact?.[artSetKey] ?? {})
        .filter(([setNum, conds]) => parseInt(setNum) <= slotkeys.length)
        .flatMap(([setNum, conds]) => Object.entries(conds).map(([condKey, c]) =>
          <ConditionalDisplay key={c.key} conditional={c} stats={condCharStats} onChange={val => characterDispatch({ conditionalValues: val })} />
        )))} */}
  </Box>
}
function CharWeaponCondDisplay() {
  const { data, characterDispatch } = useContext(DataContext)
  return <Box >
    {/* {Object.entries(Conditional.partyConditionals?.weapon?.[condCharStats.weapon.key] ?? {}).map(([condKey, cond]) =>
      <ConditionalDisplay key={cond.key} conditional={cond} stats={condCharStats} onChange={val => characterDispatch({ conditionalValues: val })} />
    )} */}
  </Box>
}
function CharTalentCondDisplay() {
  const { data, characterDispatch } = useContext(DataContext)
  // Edit the Teammate's ConditionalValues
  // const condCharKey = condCharStats.characterKey
  // const condCharKeyHashed = condCharKey === "Traveler" ? `Traveler_${condCharStats.characterEle}` : condCharKey

  // const charConds = Object.entries(Conditional.partyConditionals?.character?.[condCharKeyHashed] ?? {}).filter(([cKey, conditional]) =>
  //   Conditional.canShow(conditional, condCharStats))
  return <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }} >
    {/* {charConds.map(([condKey, cond]) =>
      <ConditionalDisplay key={condKey} conditional={cond} stats={condCharStats} onChange={val => characterDispatch({ conditionalValues: val })} />
    )} */}
  </CardContent>
}
