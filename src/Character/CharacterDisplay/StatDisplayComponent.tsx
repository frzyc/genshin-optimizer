import { CardContent, Divider, Grid, Typography } from "@mui/material"
import CardDark from "../../Components/Card/CardDark"
import StatDisplay from "../../Components/StatDisplay"
import { Sheets } from "../../ReactHooks/useSheets"
import { ICachedCharacter } from "../../Types/character"
import { ICalculatedStats } from "../../Types/stats"
import { getFormulaTargetsDisplayHeading } from "../CharacterUtil"

type StatDisplayComponentProps = {
  sheets: Sheets
  character: ICachedCharacter
  statsDisplayKeys: any,
  equippedBuild?: ICalculatedStats
  newBuild?: ICalculatedStats
}

export default function StatDisplayComponent({ sheets, character, equippedBuild, newBuild, statsDisplayKeys }: StatDisplayComponentProps) {
  const build = (newBuild ? newBuild : equippedBuild) as ICalculatedStats
  return <Grid container spacing={1}>{Object.entries(statsDisplayKeys).map(([sectionKey, sectionValues]: any) => {
    const header = getFormulaTargetsDisplayHeading(sectionKey, sheets, build)
    return <Grid item key={sectionKey} xs={12} sm={6} md={4} lg={4}>
      <CardDark sx={{ height: "100%", }}>
        <CardContent sx={{ py: 1 }}>
          <Typography variant="subtitle1">{header}</Typography>
        </CardContent>
        <Divider />
        <CardContent>
          {sectionValues.map(statKey => <StatDisplay key={JSON.stringify(statKey)} {...{ character, equippedBuild, newBuild, statKey }} />)}
        </CardContent>
      </CardDark>
    </Grid>
  })}</Grid>
}