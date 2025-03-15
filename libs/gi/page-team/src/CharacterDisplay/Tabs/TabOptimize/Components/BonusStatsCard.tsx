import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import {
  DataContext,
  FieldDisplayList,
  NodeFieldDisplay,
} from '@genshin-optimizer/gi/ui'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import BarChartIcon from '@mui/icons-material/BarChart'
import { Button, CardHeader, Divider } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import BonusStatsModal from '../../../BonusStatsModal'
export default function BonusStatsCard() {
  const { t } = useTranslation(['page_character_optimize', 'common'])
  const [show, onShow, onHide] = useBoolState()
  const {
    teamChar: { bonusStats },
  } = useContext(TeamCharacterContext)
  const { data } = useContext(DataContext)
  const bonusStatsKeys = Object.keys(bonusStats)
  const nodes = bonusStatsKeys.map((k) =>
    data.get(input.customBonus[k] as NumNode),
  )
  return (
    <CardThemed bgt="light">
      <BonusStatsModal open={show} onClose={onHide} />
      <CardHeader
        title={t('bonusStats.title')}
        titleTypographyProps={{ variant: 'subtitle1' }}
        avatar={<BarChartIcon />}
        action={
          <Button color="info" onClick={onShow}>
            {t('common:edit')}
          </Button>
        }
      />
      <Divider />
      <FieldDisplayList bgt="light">
        {nodes.map((n) => (
          <NodeFieldDisplay key={JSON.stringify(n.info)} calcRes={n} />
        ))}
      </FieldDisplayList>
    </CardThemed>
  )
}
