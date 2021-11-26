import { PersonAdd } from "@mui/icons-material";
import { CardContent, CardHeader, Divider, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useContext } from 'react';
import { buildContext } from "../../Build/Build";
import CardDark from "../../Components/Card/CardDark";
import CardLight from "../../Components/Card/CardLight";
import CharacterDropdownButton from "../../Components/Character/CharacterDropdownButton";
import ConditionalDisplay from "../../Components/ConditionalDisplay";
import StatDisplay from "../../Components/StatDisplay";
import Conditional from "../../Conditional/Conditional";
import resonanceSheets from "../../Conditional/Resonance";
import useCharacterReducer from "../../ReactHooks/useCharacterReducer";
import useCharSelectionCallback from "../../ReactHooks/useCharSelectionCallback";
import useSheets, { Sheets } from "../../ReactHooks/useSheets";
import { ICachedCharacter } from "../../Types/character";
import { CharacterKey } from "../../Types/consts";
import { ICalculatedStats } from "../../Types/stats";
import CharacterCard from "../CharacterCard";
import CharacterSheet from "../CharacterSheet";
type CharacterTalentPaneProps = {
  characterSheet: CharacterSheet,
  character: ICachedCharacter,
}
export default function CharacterTeamBuffsPane({ character, character: { key: characterKey, team } }: CharacterTalentPaneProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)

  const build = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  const sheets = useSheets()
  return <Box display="flex" flexDirection="column" gap={1} alignItems="stretch">
    <TeamBuffDisplay character={character} />
    <ResonanceDisplay characterKey={characterKey} build={build} />
    <Grid container spacing={1}>
      {sheets && build.teamStats.map((tStats, i) => <Grid item xs={12} md={6} lg={4} key={i}>
        <TeammateDisplay character={character} sheets={sheets} index={i} />
      </Grid>)}
    </Grid>
  </Box>
}
const statBreakpoint = {
  xs: 12, sm: 6, md: 6, lg: 4,
} as const
function TeamBuffDisplay({ character }: { character: ICachedCharacter }) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  const build = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  if (!Object.keys(build.partyBuff).length) return null
  return <CardLight>
    <CardContent>
      Team Buffs
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container columnSpacing={2} rowSpacing={1}>
        {Object.entries(build.partyBuff).map(([statKey, value]) => <Grid item {...statBreakpoint} key={statKey} >
          <StatDisplay character={character} newBuild={newBuild} equippedBuild={equippedBuild} statKey={statKey} partyBuff />
        </Grid>)}
      </Grid>
    </CardContent>
  </CardLight>
}
function ResonanceDisplay({ build, characterKey }: { build: ICalculatedStats, characterKey: CharacterKey }) {
  const characterDispatch = useCharacterReducer(characterKey)
  return <CardLight>
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
}
function TeammateDisplay({ character, character: { key: characterKey, team }, sheets, index }:
  { character: ICachedCharacter, sheets: Sheets, index: number }) {
  const onClickHandler = useCharSelectionCallback()
  const characterDispatch = useCharacterReducer(characterKey)
  const { newBuild, equippedBuild } = useContext(buildContext)
  const condCharStats = equippedBuild?.teamStats[index]
  return <buildContext.Provider value={{ equippedBuild: equippedBuild?.teamStats[index] ?? undefined, newBuild: newBuild?.teamStats[index] ?? undefined }}>
    <CardLight>
      <CardContent>
        <CharacterDropdownButton fullWidth value={condCharStats?.characterKey ?? ""}
          onChange={charKey => characterDispatch({ type: "team", index, charKey })}
          filter={(_, ck) => ck !== characterKey && !team.includes(ck)} unSelectText={`Teammate ${index + 1}`} unSelectIcon={<PersonAdd />} />
      </CardContent>
      {condCharStats && <CharacterCard characterKey={condCharStats.characterKey}
        onClickHeader={onClickHandler}
        build={condCharStats}
        artifactChildren={<CharArtifactCondDisplay condCharStats={condCharStats} />}
        weaponChildren={<CharWeaponCondDisplay condCharStats={condCharStats} />}
        footer={sheets && character && <CharTalentCondDisplay condCharStats={condCharStats} character={character} sheets={sheets} />} />}
    </CardLight>
  </buildContext.Provider>
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