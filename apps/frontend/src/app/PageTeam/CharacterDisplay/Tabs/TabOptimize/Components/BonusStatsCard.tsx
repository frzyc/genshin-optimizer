import type { NumNode } from '@genshin-optimizer/gi/wr'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import { CardContent, Divider, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import CardLight from '../../../../../Components/Card/CardLight'
import { NodeFieldDisplay } from '../../../../../Components/FieldDisplay'
import { DataContext } from '../../../../../Context/DataContext'
import { TeamCharacterContext } from '../../../../../Context/TeamCharacterContext'

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
    <CardLight>
      <CardContent>
        <Typography
          sx={{ fontWeight: 'bold' }}
        >{t`bonusStats.title`}</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        {nodes.map((n) => (
          <NodeFieldDisplay key={JSON.stringify(n.info)} node={n} />
        ))}
      </CardContent>
    </CardLight>
  )
}
