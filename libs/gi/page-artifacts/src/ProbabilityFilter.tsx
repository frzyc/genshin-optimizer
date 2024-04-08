import { CardThemed, ColorText } from '@genshin-optimizer/common/ui'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import { allSubstatKeys } from '@genshin-optimizer/gi/consts'
import { StatEditorList } from '@genshin-optimizer/gi/ui'
import { CardContent, Divider, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
const keys = [...allSubstatKeys]
export default function ProbabilityFilter({
  probabilityFilter: statFilters = {},
  setProbabilityFilter: setStatFilters,
  disabled = false,
}: {
  probabilityFilter: Dict<SubstatKey, number>
  setProbabilityFilter: (object: Dict<SubstatKey, number>) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('artifact')

  return (
    <CardThemed>
      <CardContent sx={{ py: 1 }}>
        <Typography variant="h6">Roll Probability Calculator</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <CardThemed bgt="light">
              <CardContent>
                <Typography>
                  This UI only pops up when "Sort by"
                  <strong>Probability</strong>. In conjunction with the Artifact
                  Filters above, this UI allows you to set a criteria for
                  substats values, and it will sort the artifacts by those with
                  the highest probability to roll into those criteria values.
                  <ColorText color="warning">
                    {' '}
                    Artifacts that already reach the criteria(100%) or are at 0%
                    are hidden.
                  </ColorText>
                </Typography>
              </CardContent>
            </CardThemed>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            spacing={1}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <StatEditorList
              statKeys={keys}
              statFilters={statFilters}
              setStatFilters={setStatFilters}
              disabled={disabled}
              label={t('probabilityFilter.label')}
            />
          </Grid>
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
