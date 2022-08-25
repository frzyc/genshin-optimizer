import { ArrowRightAlt } from "@mui/icons-material";
import { Box, CardContent, Divider, Grid, Link as MuiLink, Skeleton, styled, Tab, Tabs, Typography } from "@mui/material";
import React, { Suspense } from "react";
import ReactGA from 'react-ga4';
import { useTranslation } from 'react-i18next';
import { Link, Route, Routes, useMatch } from "react-router-dom";
import CardDark from "../Components/Card/CardDark";
import CardLight from "../Components/Card/CardLight";
import SqBadge from "../Components/SqBadge";
import material from "../Data/Materials/Material";
import KeyMap from "../KeyMap";
import { allArtifactSets, allCharacterKeys, allWeaponKeys } from "../Types/consts";

export default function PageDocumentation() {
  // const { t } = useTranslation("documentation")
  ReactGA.send({ hitType: "pageview", page: '/doc' })

  const { params: { currentTab } } = useMatch("/doc/:currentTab") ?? { params: { currentTab: "" } }

  return <CardDark sx={{ my: 1 }}>
    <Grid container sx={{ px: 2, py: 1 }}>
      <Grid item flexGrow={1}>
        <Typography variant="h6">
          Documentation
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="h6">
          <SqBadge color="info">Version. 2</SqBadge>
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
              <Tab label="Overview" value="" component={Link} to="" />
              <Tab label={"Key naming convention"} value="KeyNaming" component={Link} to="KeyNaming" />
              <Tab label={<code>StatKey</code>} value="StatKey" component={Link} to="StatKey" />
              <Tab label={<code>ArtifactSetKey</code>} value="ArtifactSetKey" component={Link} to="ArtifactSetKey" />
              <Tab label={<code>CharacterKey</code>} value="CharacterKey" component={Link} to="CharacterKey" />
              <Tab label={<code>WeaponKey</code>} value="WeaponKey" component={Link} to="WeaponKey" />
              <Tab label={<code>MaterialKey</code>} value="MaterialKey" component={Link} to="MaterialKey" />
              <Tab label={"Version History"} value="VersionHistory" component={Link} to="VersionHistory" />
            </Tabs>
          </CardLight>
        </Grid>
        <Grid item xs={12} md={10}>
          <CardLight sx={{ height: "100%" }}>
            <CardContent>
              <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path="/VersionHistory" element={<VersionHistoryPane />} />
                  <Route path="/MaterialKey" element={<MaterialKeyPane />} />
                  <Route path="/ArtifactSetKey" element={<ArtifactSetKeyPane />} />
                  <Route path="/WeaponKey" element={<WeaponKeyPane />} />
                  <Route path="/CharacterKey" element={<CharacterKeyPane />} />
                  <Route path="/StatKey" element={<StatKeyPane />} />
                  <Route path="/KeyNaming" element={<KeyNamingPane />} />
                </Routes>
              </Suspense>
            </CardContent>
          </CardLight>
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}

const goodCode = `interface IGOOD {
  format: "GOOD" // A way for people to recognize this format.
  version: number // GOOD API version.
  source: string // The app that generates this data.
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
  materials?: { // Added in version 2
    [key:MaterialKey]: number
  }
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
function KeyNamingPane() {
  return <>
    <CardDark>
      <CardContent>
        <Typography>Key Naming Convention</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Typography gutterBottom>The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in <strong>PascalCase</strong>. This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)</Typography>
        <Typography gutterBottom> To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:</Typography>
        <Typography><code>Gladiator's Finale</code> <ArrowRightAlt sx={{ verticalAlign: "bottom" }} /> <code>GladiatorsFinale</code></Typography>
        <Typography><code>Spirit Locket of Boreas</code> <ArrowRightAlt sx={{ verticalAlign: "bottom" }} /> <code>SpiritLocketOfBoreas</code></Typography>
        <Typography><code>"The Catch"</code> <ArrowRightAlt sx={{ verticalAlign: "bottom" }} /> <code>TheCatch</code></Typography>
      </CardContent>
    </CardDark>
  </>
}

function StatKeyPane() {
  // const { t } = useTranslation()
  const statKeys = ["hp", "hp_", "atk", "atk_", "def", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_", "dendro_dmg_"] as const
  const statKeysCode = `type StatKey\n  = ${statKeys.map(k => `"${k}" //${KeyMap.getArtStr(k)}`).join(`\n  | `)}`
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
function MaterialKeyPane() {
  const { t } = useTranslation("material_gen")
  const weaponKeysCode = `type MaterialKey\n  = ${Object.keys(material as any).sort().map(k => `"${k}" //${t(`${k}.name`)}`).join(`\n  | `)}`
  return <>
    <Typography gutterBottom variant="h4">MaterialKey</Typography>
    <CardDark>
      <CardContent>
        <Typography gutterBottom>The material keys here are generated using the <MuiLink href="https://github.com/Dimbreath/GenshinData/blob/master/ExcelBinOutput/MaterialExcelConfigData.json" target="_blank" rel="noreferrer"><code>MaterialExcelConfigData.json</code></MuiLink> of the datamine. The item names are taken from the english translation, and then converted into <MuiLink component={Link} to="KeyNaming"><code>PascalCase</code></MuiLink>.</Typography>
        <CodeBlock text={weaponKeysCode} />
      </CardContent>
    </CardDark>
  </>
}

function VersionHistoryPane() {
  return <Box display="flex" flexDirection="column" gap={2}>
    <Typography gutterBottom variant="h4">Version History</Typography>
    <CardDark>
      <CardContent>
        <Typography>
          Version 1
        </Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Typography>Created general <code>IGOOD</code> format with character, weapon, artifact fields.</Typography>
      </CardContent>
    </CardDark>
    <CardDark>
      <CardContent>
        <Typography>
          Version 2
        </Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Typography>Adds <code>materials</code> field to <code>IGOOD</code>. All other fields remain the same. V2 is backwards compatible with V1.</Typography>
      </CardContent>
    </CardDark>
  </Box>
}

type LineNumberProps = {
  digits?: number;
}
const LineNumber = styled("textarea")<LineNumberProps>(({ theme, digits = 2 }) => ({
  width: `${digits}em`, overflow: "hidden", userSelect: "none", color: theme.palette.text.secondary, resize: "none", border: "none", whiteSpace: "pre", fontFamily: "monospace", lineHeight: 1,
  "&:disabled": {
    backgroundColor: "transparent"
  }
}))

const CodeArea = styled("textarea")(({ theme }) => ({
  "&:disabled": {
    backgroundColor: "transparent"
  },
  lineHeight: 1,
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
    <LineNumber disabled={true} spellCheck="false" aria-label='Code Sample' sx={{ height: `${lines + 1}em` }} value={lineNums} unselectable="on" digits={lines.toString().length} />
    <CodeArea sx={{ flexGrow: 1, height: `${lines + 1}em` }} disabled={true} spellCheck="false" aria-label='Code Sample' value={text} />
  </Box>
}
