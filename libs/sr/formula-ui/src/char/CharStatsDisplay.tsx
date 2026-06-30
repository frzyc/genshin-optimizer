import { CardThemed } from '@genshin-optimizer/common-ui'
import { TagFieldDisplay } from '@genshin-optimizer/game-opt-sheet-ui'
import { own } from '@genshin-optimizer/sr-formula'
import { useSrCalcContext } from '@genshin-optimizer/sr-ui'
import { Box, CardContent } from '@mui/material'
import { tagToTagField } from '../util'

export function CharStatsDisplay() {
  const calc = useSrCalcContext()
  return (
    <CardThemed>
      <CardContent>
        {calc?.listFormulas(own.listing.formulas).map((read, index) => (
          <TagFieldDisplay
            key={index}
            field={tagToTagField(read.tag)}
            calcRead={read}
            showZero
            component={Box}
          />
        ))}
      </CardContent>
    </CardThemed>
  )
}
