import { Masonry } from "@mui/lab"
import { CardContent, CardHeader, Divider } from "@mui/material"
import { Box } from "@mui/system"
import CardDark from "../../Components/Card/CardDark"
import ImgIcon from "../../Components/Image/ImgIcon"
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
  return <Box sx={{ mr: -1, mb: -1 }}><Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1}>{Object.entries(statsDisplayKeys).map(([sectionKey, sectionValues]: any) => {
    const header = getFormulaTargetsDisplayHeading(sectionKey, sheets, build)
    return <CardDark key={sectionKey}>
      <CardHeader avatar={header.icon && <ImgIcon size={2} sx={{ m: -1 }} src={header.icon} />} title={header.title} titleTypographyProps={{ variant: "subtitle1" }} />
      <Divider />
      <CardContent>
        {sectionValues.map(statKey => <StatDisplay key={JSON.stringify(statKey)} {...{ character, equippedBuild, newBuild, statKey }} />)}
      </CardContent>
    </CardDark>
  })}</Masonry ></Box>
}