import { CardContent, Divider, Grid, Typography } from "@mui/material"
import { ArtifactSheet } from "../../Artifact/ArtifactSheet"
import CardDark from "../../Components/Card/CardDark"
import StatDisplay from "../../Components/StatDisplay"
import { ICachedCharacter } from "../../Types/character"
import { ArtifactSetKey } from "../../Types/consts"
import { ICalculatedStats } from "../../Types/stats"
import WeaponSheet from "../../Weapon/WeaponSheet"
import CharacterSheet from "../CharacterSheet"
import { getFormulaTargetsDisplayHeading } from "../CharacterUtil"

type StatDisplayComponentProps = {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  },
  character: ICachedCharacter
  statsDisplayKeys: any,
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}

export default function StatDisplayComponent({ sheets, sheets: { characterSheet, weaponSheet }, character, equippedBuild, newBuild, statsDisplayKeys }: StatDisplayComponentProps) {
  const build = newBuild ? newBuild : equippedBuild
  return <Grid container spacing={1}>{Object.entries(statsDisplayKeys).map(([sectionKey, sectionValues]: any) => {
    const header = getFormulaTargetsDisplayHeading(sectionKey, sheets, build?.characterEle)
    return <Grid item key={sectionKey} xs={12} sm={6} md={4} lg={4}>
      <CardDark sx={{ height: "100%", }}>
        <CardContent sx={{ py: 1 }}>
          <Typography variant="subtitle1">{header}</Typography>
        </CardContent>
        <Divider />
        <CardContent>
          {sectionValues.map(statKey => <StatDisplay key={JSON.stringify(statKey)} {...{ characterSheet, weaponSheet, character, equippedBuild, newBuild, statKey }} />)}
        </CardContent>
      </CardDark>
    </Grid>
  })}</Grid>
}