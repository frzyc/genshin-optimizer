import { Box, CardContent, Divider, Grid, Skeleton, styled, Tab, Tabs, Typography } from "@mui/material";
import React, { Suspense } from "react";
import ReactGA from 'react-ga';
import { useTranslation } from 'react-i18next';
import { HashRouter, Link, Route, Switch, useRouteMatch } from "react-router-dom";
import CardDark from "../Components/Card/CardDark";
import CardLight from "../Components/Card/CardLight";
import SqBadge from "../Components/SqBadge";
import { StatData } from "../StatData";
import { allArtifactSets, allCharacterKeys, allWeaponKeys } from "../Types/consts";

export default function HomeDisplay(props: any) {
  // const { t } = useTranslation("documentation")
  ReactGA.pageview('/doc')

  const routeMatch = useRouteMatch({
    path: "/doc/:slug",
    strict: true,
    sensitive: true
  });
  const currentTab = (routeMatch?.params as any)?.slug ?? ""

  return <HashRouter basename="/doc/">
    <CardDark sx={{ my: 1 }}>
      <Grid container sx={{ px: 2, py: 1 }}>
        <Grid item flexGrow={1}>
          <Typography variant="h6">
            Documentation
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6">
            <SqBadge color="info">Version. 1</SqBadge>
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12} md={2}>
            <CardLight sx={{ height: "100%" }}>
              <Tabs
                orientation="vertical"
                value={currentTab}
                aria-label="Documentation Navigation"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab label="Overview" value="" component={Link} to="/" />
                <Tab label={<code>StatKey</code>} value="StatKey" component={Link} to="/StatKey" />
                <Tab label={<code>ArtifactSetKey</code>} value="ArtifactSetKey" component={Link} to="/ArtifactSetKey" />
                <Tab label={<code>CharacterKey</code>} value="CharacterKey" component={Link} to="/CharacterKey" />
                <Tab label={<code>WeaponKey</code>} value="WeaponKey" component={Link} to="/WeaponKey" />
              </Tabs>
            </CardLight>
          </Grid>
          <Grid item xs={12} md={10}>
            <CardLight sx={{ height: "100%" }}>
              <CardContent>
                <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
                  <Switch>
                    <Route path="/ArtifactSetKey" component={ArtifactSetKeyPane} />
                    <Route path="/WeaponKey" component={WeaponKeyPane} />
                    <Route path="/CharacterKey" component={CharacterKeyPane} />
                    <Route path="/StatKey" component={StatKeyPane} />
                    <Route path="/" component={Overview} />
                  </Switch>
                </Suspense>
              </CardContent>
            </CardLight>
          </Grid>
        </Grid>
      </CardContent>
    </CardDark>
  </HashRouter >
}

const goodCode = `interface IGOOD {
  format: "GOOD" //A way for people to recognize this format.
  version: number //API version.
  source: string //the app that generates this data.
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
}`

const artifactCode = `interface IArtifact {
  setKey: SetKey //e.g. "GladiatorsFinale"
  slotKey: SlotKey //e.g. "plume"
  level: number //0-20 inclusive
  rarity: number //1-5 inclusive
  mainStatKey: StatKey
  location: CharacterKey|"" //where "" means not equipped.
  lock: boolean //Whether the artifact is locked in game.
  substats: ISubstat[]
}
  
interface ISubstat {
  key: StatKey //e.g. "critDMG_"
  value: number //e.g. 19.4
}

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet"`

const weaponCode = `interface IWeapon {
  key: WeaponKey //"CrescentPike"
  level: number //1-90 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number //1-5 inclusive
  location: CharacterKey | "" //where "" means not equipped.
  lock: boolean //Whether the weapon is locked in game.
}`
const characterCode = `interface ICharacter {
  key: CharacterKey //e.g. "Rosaria"
  level: number //1-90 inclusive
  constellation: number //0-6 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: { //does not include boost from constellations. 1-15 inclusive
    auto: number
    skill: number
    burst: number
  }
}`

function Overview() {
  return <>
    <Typography gutterBottom variant="h4">Genshin Open Object Description (GOOD)</Typography>
    <Typography gutterBottom><strong>GOOD</strong> is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion.</Typography>
    <Typography gutterBottom>As of version 6.0.0, Genshin Optimizer's database export conforms to this format.</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={goodCode} />
      </CardContent>
    </CardDark>
    <br />
    <Typography gutterBottom variant="h4">Artifact data representation</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={artifactCode} />
      </CardContent>
    </CardDark>
    <br />
    <Typography gutterBottom variant="h4">Weapon data representation</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={weaponCode} />
      </CardContent>
    </CardDark>
    <br />
    <Typography gutterBottom variant="h4">Character data representation</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={characterCode} />
      </CardContent>
    </CardDark>
  </>
}

function StatKeyPane() {
  // const { t } = useTranslation()
  const statKeys = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_"]
  const statKeysCode = `type StatKey\n  = ${statKeys.map(k => `"${k}" //${StatData[k]?.name}${k?.endsWith('_') ? "%" : ""}`).join(`\n  | `)}`
  return <>
    <Typography gutterBottom variant="h4">StatKey</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={statKeysCode} />
      </CardContent>
    </CardDark>
  </>
}
function ArtifactSetKeyPane() {
  const { t } = useTranslation([...new Set(allArtifactSets)].map(k => `artifact_${k}_gen`))
  const artSetKeysCode = `type ArtifactSetKey\n  = ${[...new Set(allArtifactSets)].sort().map(k => `"${k}" //${t(`artifact_${k}_gen:setName`)}`).join(`\n  | `)}`
  return <>
    <Typography gutterBottom variant="h4">ArtifactSetKey</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={artSetKeysCode} />
      </CardContent>
    </CardDark>
  </>
}
function CharacterKeyPane() {
  const { t } = useTranslation([...new Set(allCharacterKeys)].map(k => `char_${k}_gen`))
  const charKeysCode = `type CharacterKey\n  = ${[...new Set(allCharacterKeys)].sort().map(k => `"${k}" //${t(`char_${k}_gen:name`)}`).join(`\n  | `)}`
  return <>
    <Typography gutterBottom variant="h4">CharacterKey</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={charKeysCode} />
      </CardContent>
    </CardDark>
  </>
}
function WeaponKeyPane() {
  const { t } = useTranslation([...new Set(allWeaponKeys)].map(k => `weapon_${k}_gen`))
  const weaponKeysCode = `type WeaponKey\n  = ${[...new Set(allWeaponKeys)].sort().map(k => `"${k}" //${t(`weapon_${k}_gen:name`)}`).join(`\n  | `)}`
  return <>
    <Typography gutterBottom variant="h4">WeaponKey</Typography>
    <CardDark>
      <CardContent>
        <CodeBlock text={weaponKeysCode} />
      </CardContent>
    </CardDark>
  </>
}


const LineNumber = styled("textarea")(({ theme }) => ({
  width: "2em", overflow: "hidden", userSelect: "none", color: theme.palette.text.secondary, resize: "none", border: "none",
  "&:disabled": {
    backgroundColor: "transparent"
  }
}))

const CodeArea = styled("textarea")(({ theme }) => ({
  "&:disabled": {
    backgroundColor: "transparent"
  },
  width: "100%",
  overflowY: "auto",
  overflowX: "auto",
  fontFamily: "monospace",
  border: "none",
  // padding: 1em;
  whiteSpace: "pre",
  backgroundColor: "transparent",
  resize: "none",
  color: theme.palette.info.light
}))
function CodeBlock({ text }) {
  const lines = text.split(/\r\n|\r|\n/).length + 1
  const lineNums = Array.from(Array(lines).keys()).map(i => i + 1).join('\n')

  return <Box display="flex" flexDirection="row">
    <LineNumber disabled={true} spellCheck="false" aria-label='Code Sample' rows={lines} value={lineNums} unselectable="on" />
    <CodeArea sx={{ flexGrow: 1 }} disabled={true} spellCheck="false" aria-label='Code Sample' rows={lines} value={text} />
  </Box>
}