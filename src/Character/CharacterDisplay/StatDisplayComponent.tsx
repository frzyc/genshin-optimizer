import { Masonry } from "@mui/lab"
import { CardContent, CardHeader, Divider, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useContext } from "react"
import CardDark from "../../Components/Card/CardDark"
import { NodeFieldDisplay } from "../../Components/FieldDisplay"
import ImgIcon from "../../Components/Image/ImgIcon"
import SqBadge from "../../Components/SqBadge"
import { DataContext } from "../../DataContext"
import { input } from "../../Formula/index"
import { NodeDisplay } from "../../Formula/uiData"
import { customRead } from "../../Formula/utils"
import usePromise from "../../ReactHooks/usePromise"
import { TalentSheetElementKey } from "../../Types/character_WR"
import { ArtifactSetKey, CharacterKey, ElementKey, WeaponKey } from "../../Types/consts"
import WeaponSheet from "../../Weapon/WeaponSheet_WR"
import CharacterSheet from "../CharacterSheet_WR"


export default function StatDisplayComponent() {
  const { data } = useContext(DataContext)
  if (!data) return null
  const display = data.getDisplay() as {
    character?: Partial<Record<CharacterKey, { [key: string]: { [key: string]: NodeDisplay } }>>
    weapon?: Partial<Record<WeaponKey, { [key: string]: NodeDisplay }>>
    artifact?: Partial<Record<ArtifactSetKey, { [key: string]: NodeDisplay }>>
  }
  return <Box sx={{ mr: -1, mb: -1 }}>
    <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1}>
      <BasicStats />
      {display.character && Object.entries(display.character).map(([charKey, displayCharacter]) =>
        displayCharacter && <CharacterStats key={charKey} characterKey={charKey} displayCharacter={displayCharacter} path={["character", charKey]} />)}
      {display.weapon && Object.entries(display.weapon).map(([weaponKey, displayWeapon]) =>
        displayWeapon && <WeaponStats key={weaponKey} weaponKey={weaponKey} displayWeapon={displayWeapon as any} path={["weapon", weaponKey]} />)}
      {/* TODO: artifacts */}
      {/* TODO: trans Reactions */}
    </Masonry >
  </Box>
}
function BasicStats() {
  const { data, oldData } = useContext(DataContext)
  const it = input.total
  const nodes = [it.atk, it.hp, it.def, it.eleMas, it.critRate_, it.critDMG_, it.heal_, it.enerRech_]
  if (!data) return null
  if (data.getStr(input.weaponType).value !== "catalyst") nodes.push(it.physical_dmg_)
  nodes.push(it[`${data.getStr(input.charEle).value}_dmg_`])
  return <CardDark >
    <CardHeader title={"Basic Stats"} titleTypographyProps={{ variant: "subtitle1" }} />
    <Divider />
    <CardContent>
      {nodes.map((n, i) => <NodeFieldDisplay key={i} node={data.get(n)} oldValue={oldData ? oldData.get(n).value : undefined} />)}
    </CardContent>
  </CardDark>
}
function CharacterStats({ characterKey, displayCharacter, path }: { characterKey: CharacterKey, displayCharacter: { [key: string]: { [key: string]: NodeDisplay } }, path: string[] }) {
  const characterSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  if (!characterSheet) return null
  return <>
    {Object.entries(displayCharacter).map(([talentKey, displayTalent]) => <TalentStats key={talentKey} characterSheet={characterSheet} talentKey={talentKey as string} displayTalent={displayTalent as any} path={[...path, talentKey]} />)}
  </>
}
function TalentStats({ characterSheet, talentKey, displayTalent, path }: { characterSheet: CharacterSheet, talentKey: string, displayTalent: { [key: string]: NodeDisplay }, path: string[] }) {
  const { data, oldData } = useContext(DataContext)
  if (!data) return null
  let sub = ""
  if (talentKey === "normal" || talentKey === "charged" || talentKey === "plunging") {
    sub = talentKey.charAt(0).toUpperCase() + talentKey.slice(1).toLowerCase();
    talentKey = "auto"
  }
  const talent = characterSheet.getTalentOfKey(talentKey as TalentSheetElementKey, data.getStr(input.charEle).value as ElementKey)
  if (!talent) return null
  return <CardDark >
    <CardHeader avatar={characterSheet && <ImgIcon size={2} sx={{ m: -1 }} src={talent.img} />} title={talent.name} titleTypographyProps={{ variant: "subtitle1" }}
      action={sub ? <SqBadge ><Typography>{sub}</Typography></SqBadge> : undefined}
    />
    <Divider />
    <CardContent>
      {Object.entries(displayTalent).map(([nodeKey, n]) => <NodeFieldDisplay key={nodeKey} node={n} oldValue={oldData ? oldData.get(customRead([...path, nodeKey])).value : undefined} />)}
    </CardContent>
  </CardDark>
}

function WeaponStats({ weaponKey, displayWeapon: displayWeapon, path }: { weaponKey: WeaponKey, displayWeapon: { [key: string]: NodeDisplay }, path: string[] }) {
  const { data, oldData } = useContext(DataContext)
  const weaponSheet = usePromise(WeaponSheet.get(weaponKey), [weaponKey])
  if (!weaponSheet || !data) return null
  const img = data.get(input.weapon.asc).value < 2 ? weaponSheet?.img : weaponSheet?.imgAwaken
  return <CardDark >
    <CardHeader avatar={weaponSheet && <ImgIcon size={2} sx={{ m: -1 }} src={img} />} title={weaponSheet.name} titleTypographyProps={{ variant: "subtitle1" }} />
    <Divider />
    <CardContent>
      {Object.entries(displayWeapon).map(([nodeKey, n]) => <NodeFieldDisplay key={nodeKey} node={n} oldValue={oldData ? oldData.get(customRead([...path, nodeKey])).value : undefined} />)}
    </CardContent>
  </CardDark>
}