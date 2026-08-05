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
import { type CalcResult, UIData } from '@genshin-optimizer/gi/uidata'
import { createDataForTarget } from '@genshin-optimizer/gi/wr'
import BarChartIcon from '@mui/icons-material/BarChart'
import CommentIcon from '@mui/icons-material/Comment'
import {
  Avatar,
  Box,
  CardActionArea,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material'
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
  const dataContext = useContext(DataContext)
  const {
    path,
    weight,
    hitMode,
    reaction,
    infusionAura,
    bonusStats,
    description,
  } = customTarget
  const targetData = createDataForTarget(customTarget, {
    ...dataContext.data.data[0],
  })
  const uiDataWithConds = new UIData(targetData, undefined)
  const dataContextWithConds = {
    ...dataContext,
    data: uiDataWithConds,
  }

  const node = objPathValue(uiDataWithConds.getDisplay(), path) as
    | CalcResult
    | undefined

  return (
    <DataContext.Provider value={dataContextWithConds}>
      <CardThemed
        bgt="light"
        sx={{
          display: 'flex',
          border: selected ? '2px solid green' : undefined,
        }}
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
            {description && (
              <Tooltip
                arrow
                title={
                  description.length > 100
                    ? `${description.slice(0, 100)}...`
                    : description
                }
              >
                <Avatar style={{ backgroundColor: '#4C566A' }}>
                  <CommentIcon style={{ color: 'white' }} />
                </Avatar>
              </Tooltip>
            )}
          </Typography>
        </CardActionArea>
      </CardThemed>
    </DataContext.Provider>
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
