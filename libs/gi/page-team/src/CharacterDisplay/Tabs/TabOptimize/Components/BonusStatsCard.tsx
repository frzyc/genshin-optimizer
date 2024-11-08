import { CardThemed } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import {
  DataContext,
  FieldDisplayList,
  NodeFieldDisplay,
} from '@genshin-optimizer/gi/ui'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import { CardContent, Divider, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export default function BonusStatsCard() {
  const { t } = useTranslation('page_character_optimize')
  const {
    teamChar: { bonusStats },
  } = useContext(TeamCharacterContext)
  const { data } = useContext(DataContext)
  const bonusStatsKeys = Object.keys(bonusStats)
  if (!bonusStatsKeys.length) return null
  const nodes = bonusStatsKeys.map((k) =>
    data.get(input.customBonus[k] as NumNode)
  )
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Typography sx={{ fontWeight: 'bold' }}>
          {t('bonusStats.title')}
        </Typography>
      </CardContent>
      <Divider />
      <FieldDisplayList bgt="light">
        {nodes.map((n) => (
          <NodeFieldDisplay key={JSON.stringify(n.info)} calcRes={n} />
        ))}
      </FieldDisplayList>
    </CardThemed>
  )
}
