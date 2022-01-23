import { ExpandMore } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Box, CardContent, CardHeader, Collapse, Divider, Grid, Skeleton, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useState } from "react"
import { ArtifactSheet } from "../Artifact/ArtifactSheet_WR"
import CharacterSheet from "../Character/CharacterSheet_WR"
import { DataContext } from "../DataContext"
import { input } from "../Formula/index"
import { NodeDisplay, valueString } from "../Formula/uiData"
import KeyMap from "../KeyMap"
import usePromise from "../ReactHooks/usePromise"
import { TalentSheetElementKey } from "../Types/character_WR"
import { ArtifactSetKey, CharacterKey, ElementKey, WeaponKey } from "../Types/consts"
import WeaponSheet from "../Weapon/WeaponSheet_WR"
import CardDark from "./Card/CardDark"
import CardLight from "./Card/CardLight"
import ColorText from "./ColoredText"
import ExpandButton from "./ExpandButton"
import ImgIcon from "./Image/ImgIcon"
import SqBadge from "./SqBadge"

export default function FormulaCalcCard() {
  const [expanded, setexpanded] = useState(false)
  const toggle = useCallback(() => setexpanded(!expanded), [setexpanded, expanded])
  return <CardLight>
    <CardContent>
      <Grid container>
        <Grid item flexGrow={1}>
          <Typography>Formulas {"&"} Calculations</Typography>
          <Typography variant="caption" color="text.secondary">Expand to see every formula and all their calculations.</Typography>
        </Grid>
        <Grid item>
          <ExpandButton
            expand={expanded}
            onClick={toggle}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMore />
          </ExpandButton>
        </Grid>
      </Grid>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        <CalculationDisplay />
      </CardContent>
    </Collapse>
  </CardLight>
}

function CalculationDisplay() {
  const { data } = useContext(DataContext)
  const display = data.getDisplay()
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />} >
    <Box sx={{ mr: -1, mb: -1 }}>
      {display.character && Object.entries(display.character).map(([charKey, displayCharacter]) =>
        displayCharacter && <CharacterCalcs key={charKey} characterKey={charKey} displayCharacter={displayCharacter} />)}
      {display.weapon && Object.entries(display.weapon).map(([weaponKey, displayWeapon]) =>
        displayWeapon && <WeaponCalcs key={weaponKey} weaponKey={weaponKey} displayWeapon={displayWeapon} />)}
      {display.artifact && Object.entries(display.artifact).map(([artifactSetKey, displayArtifact]) =>
        displayArtifact && <ArtifactCalcs key={artifactSetKey} artifactSetKey={artifactSetKey} displayArtifact={displayArtifact} />)}
      {display.reaction && <ReactionCalcs displayReaction={display.reaction} />}
    </Box>
  </Suspense>
}
function CharacterCalcs({ characterKey, displayCharacter }: { characterKey: CharacterKey, displayCharacter: { [key: string]: { [key: string]: NodeDisplay } } }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  if (!characterSheet) return null
  return <>
    {Object.entries(displayCharacter).map(([talentKey, displayTalent]) => <TalentCalcs key={talentKey} characterSheet={characterSheet} talentKey={talentKey as string} displayTalent={displayTalent as any} />)}
  </>
}

function TalentCalcs({ characterSheet, talentKey, displayTalent }: { characterSheet: CharacterSheet, talentKey: string, displayTalent: { [key: string]: NodeDisplay } }) {
  const { data } = useContext(DataContext)
  let sub = ""
  if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") {
    sub = talentKey.charAt(0).toUpperCase() + talentKey.slice(1).toLowerCase();
    talentKey = "auto"
  }
  const talent = characterSheet.getTalentOfKey(talentKey as TalentSheetElementKey, data.getStr(input.charEle).value as ElementKey)
  if (!talent) return null
  return <FormulaCalc icon={talent.img} title={talent.name} displayNs={displayTalent} action={sub ? <SqBadge ><Typography>{sub}</Typography></SqBadge> : undefined} />
}

function WeaponCalcs({ weaponKey, displayWeapon: displayWeapon }: { weaponKey: WeaponKey, displayWeapon: { [key: string]: NodeDisplay } }) {
  const { data } = useContext(DataContext)
  const weaponSheet = usePromise(WeaponSheet.get(weaponKey), [weaponKey])
  if (!weaponSheet) return null
  const img = data.get(input.weapon.asc).value < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken
  return <FormulaCalc icon={img} title={weaponSheet.name} displayNs={displayWeapon} />
}

function ArtifactCalcs({ artifactSetKey, displayArtifact }: { artifactSetKey: ArtifactSetKey, displayArtifact: { [key: string]: NodeDisplay }, }) {
  const artifactSheet = usePromise(ArtifactSheet.get(artifactSetKey), [artifactSetKey])
  if (!artifactSheet) return null
  return <FormulaCalc icon={artifactSheet.defIconSrc} title={artifactSheet.name} displayNs={displayArtifact} />
}

function ReactionCalcs({ displayReaction }: { displayReaction: { [key: string]: NodeDisplay }, }) {
  return <FormulaCalc title={"Transformative Reactions"} displayNs={displayReaction} />
}

function FormulaCalc({ icon, title, action, displayNs }: { icon?: string, title: Displayable, action?: Displayable, displayNs: { [key: string]: NodeDisplay } }) {
  return <CardDark sx={{ mb: 1 }}>
    <CardHeader avatar={icon && <ImgIcon size={2} sx={{ m: -1 }} src={icon} />} title={title} action={action} titleTypographyProps={{ variant: "subtitle1" }} />
    <Divider />
    <CardContent>
      {Object.entries(displayNs).map(([key, node]) =>
        !node.isEmpty && <Accordion sx={{ bgcolor: "contentLight.main" }} key={key}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography><ColorText color={node.variant}>{KeyMap.get(node.key ?? "")}</ColorText> <strong>{valueString(node.value, node.unit)}</strong></Typography>
          </AccordionSummary>
          <AccordionDetails>
            {node.formulas.map((subform, i) => <Typography key={i}>{subform}</Typography>)}
          </AccordionDetails>
        </Accordion>)}
    </CardContent>
  </CardDark>
}
