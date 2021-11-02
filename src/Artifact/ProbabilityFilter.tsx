import { CardContent, Divider, Grid, Typography } from "@mui/material"
import { useCallback } from "react"
import { StatFilterItem } from "../Build/Components/StatFilterCard"
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import ColorText from "../Components/ColoredText"
import SqBadge from "../Components/SqBadge"
import { allSubstats, SubstatKey } from "../Types/artifact"

export default function ProbabilityFilter({ probabilityFilter: statFilters = {}, setProbabilityFilter: setStatFilters, disabled = false }: {
  probabilityFilter: Partial<Record<SubstatKey, number>>,
  setProbabilityFilter: (object: Partial<Record<SubstatKey, number>>) => void,
  disabled?: boolean
}) {
  const remainingKeys = allSubstats.filter(key => !(Object.keys(statFilters) as any).some(k => k === key))
  const setFilter = useCallback((sKey, min) => setStatFilters({ ...statFilters, [sKey]: min }), [statFilters, setStatFilters],
  )
  return <CardDark>
    <CardContent sx={{ py: 1 }}>
      <Typography variant="h6">
        Roll Probability Calculator <SqBadge color="success">TC Feature</SqBadge>
      </Typography>
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
                <ColorText color="warning"> Artifacts that already reach the criteria are hidden.</ColorText>
              </Typography>

            </CardContent>
          </CardLight>
        </Grid>
        <Grid item xs={12} md={6} container spacing={1}>
          {Object.entries(statFilters).map(([statKey, min]) => {
            return <Grid item xs={12} key={statKey} ><StatFilterItem statKey={statKey} statKeys={remainingKeys} setFilter={setFilter} disabled={disabled} value={min} close={() => {
              delete statFilters[statKey]
              setStatFilters({ ...statFilters })
            }} /></Grid>
          })}
          <Grid item xs={12}>
            <StatFilterItem value={undefined} close={undefined} statKeys={remainingKeys} setFilter={setFilter} disabled={disabled} />
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </CardDark >
}
