import { CardThemed } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type {
  AdditiveReactionKey,
  AmpReactionKey,
  InfusionAuraElementKey,
} from '@genshin-optimizer/gi/consts'
import { allAmpReactionKeys } from '@genshin-optimizer/gi/consts'
import type { CustomTarget } from '@genshin-optimizer/gi/db'
import {
  AdditiveReactionModeText,
  AmpReactionModeText,
  DataContext,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import BarChartIcon from '@mui/icons-material/BarChart'
import { Box, CardActionArea, Chip, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetDisplay from '../Tabs/TabOptimize/Components/OptimizationTargetDisplay'

export default function CustomTargetDisplay({
  selected,
  setSelect,
  customTarget,
  rank,
}: {
  selected: boolean
  setSelect: () => void
  customTarget: CustomTarget
  rank: number
}) {
  const { t } = useTranslation('page_character')
  const { data } = useContext(DataContext)
  const { path, weight, hitMode, reaction, infusionAura, bonusStats } =
    customTarget

  const node = objPathValue(data.getDisplay(), path) as CalcResult | undefined

  return (
    <CardThemed
      bgt="light"
      sx={{ display: 'flex', border: selected ? '2px solid green' : undefined }}
    >
      <CardActionArea sx={{ p: 1, flexGrow: 1 }} onClick={setSelect}>
        <Typography
          component="div"
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Chip label={`#${rank}`} sx={{ minWidth: '4em' }} />
          <Chip label={`x${weight}`} sx={{ minWidth: '5em' }} />

          <OptimizationTargetDisplay
            optimizationTarget={path}
            showEmptyTargets
          />
          <Box sx={{ flexGrow: 1 }} />
          {node && (
            <ReactionChip
              reaction={reaction}
              node={node}
              infusionAura={infusionAura}
            />
          )}
          {!!Object.values(bonusStats).length && (
            <Chip
              avatar={<BarChartIcon />}
              label={<strong>{Object.values(bonusStats).length}</strong>}
            />
          )}
          <Chip label={t(`hitmode.${hitMode}`)} />
        </Typography>
      </CardActionArea>
    </CardThemed>
  )
}
function ReactionChip({
  node,
  reaction,
  infusionAura,
}: {
  node: CalcResult
  reaction?: AmpReactionKey | AdditiveReactionKey
  infusionAura?: InfusionAuraElementKey
}) {
  const ele = node.info.variant ?? 'physical'

  if (
    !['pyro', 'hydro', 'cryo', 'electro', 'dendro'].some(
      (e) => e === ele || e === infusionAura
    )
  )
    return null
  const title =
    reaction &&
    (([...allAmpReactionKeys] as string[]).includes(reaction) ? (
      <AmpReactionModeText reaction={reaction as AmpReactionKey} />
    ) : (
      <AdditiveReactionModeText reaction={reaction as AdditiveReactionKey} />
    ))
  if (!title) return null

  return <Chip label={title} />
}
