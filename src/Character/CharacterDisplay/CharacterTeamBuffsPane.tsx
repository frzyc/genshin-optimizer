import { PersonAdd } from "@mui/icons-material";
import { CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext } from 'react';
import { buildContext } from "../../Build/Build";
import CardDark from "../../Components/Card/CardDark";
import CardLight from "../../Components/Card/CardLight";
import CharacterDropdownButton from "../../Components/Character/CharacterDropdownButton";
import ConditionalDisplay from "../../Components/ConditionalDisplay";
import Conditional from "../../Conditional/Conditional";
import resonanceSheets from "../../Conditional/Resonance";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import useCharSelectionCallback from "../../ReactHooks/useCharSelectionCallback";
import useSheets, { Sheets } from "../../ReactHooks/useSheets";
import { ICachedCharacter } from "../../Types/character";
import { ICalculatedStats } from "../../Types/stats";
import CharacterCard from "../CharacterCard";
import CharacterSheet from "../CharacterSheet";
type CharacterTalentPaneProps = {
  characterSheet: CharacterSheet,
  character: ICachedCharacter,
}
export default function CharacterTeamBuffsPane({ character, character: { key: characterKey, team } }: CharacterTalentPaneProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const characterDispatch = useCharacterReducer(characterKey)
  const build = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  const sheets = useSheets()
  return <Box display="flex" flexDirection="column" gap={1} alignItems="stretch">
    <CardLight>
      <CardContent>
        Team Resonance
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container spacing={1}>
          {resonanceSheets.map((doc, i) =>
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
          )}
        </Grid>
      </CardContent>
    </CardLight>
    <Grid container spacing={1}>
      {sheets && build.teamStats.map((tStats, i) => <Grid item xs={12} md={6} lg={4} key={i}>
        <TeammateDisplay build={build} character={character} condCharStats={tStats} sheets={sheets} index={i} />
      </Grid>)}
    </Grid>
  </Box>
}
function TeammateDisplay({ build: { characterEle, teamElement }, character, character: { key: characterKey, team }, condCharStats, sheets, index }:
  { build: ICalculatedStats, character: ICachedCharacter, condCharStats: ICalculatedStats | null, sheets: Sheets, index: number }) {
  const onClickHandler = useCharSelectionCallback()
  const characterDispatch = useCharacterReducer(characterKey)
  return <CardLight>
    <CardContent>
      <CharacterDropdownButton fullWidth value={condCharStats?.characterKey ?? ""} onChange={c => {
        team[index] = c
        characterDispatch({ team })
      }} filter={(_, ck) => ck !== characterKey && !team.includes(ck)} unSelectText={`Teammate ${index + 1}`} unSelectIcon={<PersonAdd />} />
    </CardContent>
    {condCharStats && <CharacterCard characterKey={condCharStats.characterKey}
      onClickHeader={onClickHandler}
      artifactChildren={<CharArtifactCondDisplay condCharStats={condCharStats} />}
      weaponChildren={<CharWeaponCondDisplay condCharStats={condCharStats} />}
      footer={sheets && character && <CharTalentCondDisplay condCharStats={condCharStats} character={character} sheets={sheets} />} />}
  </CardLight>
}
function CharArtifactCondDisplay({ condCharStats }: { condCharStats: ICalculatedStats }) {
  const characterDispatch = useCharacterReducer(condCharStats.characterKey)
  return <Box >
    {Object.entries(condCharStats.setToSlots).map(([artSetKey, slotkeys]) =>
      Object.entries(Conditional.partyConditionals?.artifact?.[artSetKey] ?? {})
        .filter(([setNum, conds]) => parseInt(setNum) >= slotkeys.length)
        .flatMap(([setNum, conds]) => Object.entries(conds).map(([condKey, c]) =>
          <ConditionalDisplay key={c.key} conditional={c} stats={condCharStats} onChange={val => characterDispatch({ conditionalValues: val })} />
        )))}
  </Box>
}
function CharWeaponCondDisplay({ condCharStats }: { condCharStats: ICalculatedStats }) {
  const characterDispatch = useCharacterReducer(condCharStats.characterKey)
  return <Box >{Object.entries(Conditional.partyConditionals?.weapon?.[condCharStats.weapon.key] ?? {}).map(([condKey, cond]) =>
    <ConditionalDisplay key={cond.key} conditional={cond} stats={condCharStats} onChange={val => characterDispatch({ conditionalValues: val })} />
  )}</Box>
}
function CharTalentCondDisplay({ character, condCharStats, sheets }:
  { character: ICachedCharacter, condCharStats: ICalculatedStats, sheets: Sheets }) {
  // Edit the Teammate's ConditionalValues
  const characterDispatch = useCharacterReducer(condCharStats.characterKey)
  const condCharKey = condCharStats.characterKey
  const condCharKeyHashed = condCharKey === "Traveler" ? `Traveler_${condCharStats.characterEle}` : condCharKey

  const charConds = Object.entries(Conditional.partyConditionals?.character?.[condCharKeyHashed] ?? {}).filter(([cKey, conditional]) =>
    Conditional.canShow(conditional, condCharStats))
  return <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }} >
    {charConds.map(([condKey, cond]) =>
      <ConditionalDisplay key={condKey} conditional={cond} stats={condCharStats} onChange={val => characterDispatch({ conditionalValues: val })} />
    )}
  </CardContent>
}