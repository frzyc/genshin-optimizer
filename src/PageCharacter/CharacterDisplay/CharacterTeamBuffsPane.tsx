import { PersonAdd } from "@mui/icons-material";
import { CardContent, Divider, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext } from 'react';
import CardLight from "../../Components/Card/CardLight";
import CharacterDropdownButton from "../../Components/Character/CharacterDropdownButton";
import ConditionalDisplay from "../../Components/ConditionalDisplay";
import { NodeFieldDisplay } from "../../Components/FieldDisplay";
import resonanceSheets from "../../Conditional/Resonance";
import { ArtifactSheet } from "../../Data/Artifacts/ArtifactSheet";
import { DataContext, dataContextObj } from "../../DataContext";
import { input } from "../../Formula";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import useCharSelectionCallback from "../../ReactHooks/useCharSelectionCallback";
import usePromise from "../../ReactHooks/usePromise";
import { ElementKey } from "../../Types/consts";
import { DocumentSection } from "../../Types/sheet";
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
  // TODO: this is not flat enough to crawl...
  const teamBuffs = data.getTeamBuff().total
  if (!teamBuffs || !Object.keys(teamBuffs).length) return null
  return <CardLight>
    <CardContent>
      Team Buffs
    </CardContent>
    <Divider />
    <CardContent>
      {/* TODO: */}
      <Grid container columnSpacing={2} rowSpacing={1}>
        {/* {Object.values(teamBuffs).map((n, i) => n && <Grid item {...statBreakpoint} key={i} ><NodeFieldDisplay node={n} oldValue={oldData?.get(n)?.value} /></Grid>)} */}
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
  const dataContext = useContext(DataContext)
  const { character: active, teamData, characterDispatch: activeCharacterDispatch } = dataContext
  const activeCharacterKey = active.key
  const characterKey = active.team[index]
  const characterDispatch = useCharacterReducer(characterKey)
  // TODO: this UIData should be fed from the main CharacterDisplayCard for teams.
  const onClickHandler = useCharSelectionCallback()

  const dataBundle = teamData[characterKey]
  const teamMateDataContext: dataContextObj | undefined = dataBundle && characterDispatch && {
    character: dataBundle.character,
    characterSheet: dataBundle.characterSheet,
    data: dataBundle.target,
    teamData: teamData,
    mainStatAssumptionLevel: 0,
    characterDispatch
  }
  return <CardLight>
    <CardContent>
      <CharacterDropdownButton fullWidth value={characterKey}
        onChange={charKey => activeCharacterDispatch({ type: "team", index, charKey })}
        filter={(_, ck) => ck !== activeCharacterKey && !active.team.includes(ck)} unSelectText={`Teammate ${index + 1}`} unSelectIcon={<PersonAdd />} />
    </CardContent>
    {teamMateDataContext && <DataContext.Provider value={teamMateDataContext}>
      <CharacterCard characterKey={characterKey}
        onClickHeader={onClickHandler}
        artifactChildren={<CharArtifactCondDisplay dataContext={dataContext} />}
        weaponChildren={<CharWeaponCondDisplay dataContext={dataContext} />}
        characterChildren={<CharTalentCondDisplay dataContext={dataContext} />}
      />
    </DataContext.Provider>}
  </CardLight>

}
function CharArtifactCondDisplay({ dataContext }: { dataContext: dataContextObj }) {
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  if (!artifactSheets) return null
  const sections = Object.values(artifactSheets).flatMap(s => Object.values(s.setEffects).flatMap(se => se?.document)).filter(d => d) as DocumentSection[]
  return <DisplaySectionsTeamCond sections={sections} dataContext={dataContext} />
}
function CharWeaponCondDisplay({ dataContext }: { dataContext: dataContextObj }) {
  const { data, teamData, character: { key: charKey } } = useContext(DataContext)
  const weaponSheet = teamData[charKey]!.weaponSheet

  return <DisplaySectionsTeamCond sections={weaponSheet.document} dataContext={dataContext} />
}
function CharTalentCondDisplay({ dataContext }: { dataContext: dataContextObj }) {
  const { data, teamData, character: { key: charKey } } = useContext(DataContext)
  const characterSheet = teamData[charKey]!.characterSheet
  const talent = characterSheet.getTalent(data.get(input.charEle).value as ElementKey)!
  const sections = Object.values(talent.sheets).flatMap(sts => sts.sections)
  return <DisplaySectionsTeamCond sections={sections} dataContext={dataContext} />
}

function DisplaySectionsTeamCond({ sections, dataContext }: { sections: DocumentSection[], dataContext: dataContextObj }) {
  return <Box display="flex" flexDirection="column" gap={1} pt={0} >
    {sections.map(section => section.conditional?.teamBuff && <ConditionalDisplay conditional={section.conditional} fieldContext={dataContext} />)}
  </Box >
}
