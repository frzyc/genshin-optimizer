import { CardContent, Divider, Grid, Typography } from "@mui/material"
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import ColorText from "../Components/ColoredText"
import StatEditorList from "../Components/StatEditorList"
import { allSubstatKeys, SubstatKey } from "../Types/artifact"
const keys = [...allSubstatKeys]
export default function ProbabilityFilter({ probabilityFilter: statFilters = {}, setProbabilityFilter: setStatFilters, disabled = false }: {
  probabilityFilter: Dict<SubstatKey, number>,
  setProbabilityFilter: (object: Dict<SubstatKey, number>) => void,
  disabled?: boolean
}) {
  return <CardDark>
    <CardContent sx={{ py: 1 }}>
      <Typography variant="h6">Roll Probability Calculator</Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container spacing={1}>
        <Grid item xs={12} md={6}>
          <CardLight>
            <CardContent>
              <Typography>
                This UI only pops up when "Sort by" <strong>Probability</strong>.
                In conjunction with the Artifact Filters above, this UI allows you to set a criteria for substats values, and it will sort the artifacts by those with the highest probability to roll into those criteria values.
                <ColorText color="warning"> Artifacts that already reach the criteria(100%) or are at 0% are hidden.</ColorText>
              </Typography>

            </CardContent>
          </CardLight>
        </Grid>
        <Grid item xs={12} md={6} spacing={1} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <StatEditorList statKeys={keys} statFilters={statFilters} setStatFilters={setStatFilters} disabled={disabled} />
        </Grid>
      </Grid>
    </CardContent>
  </CardDark >
}
