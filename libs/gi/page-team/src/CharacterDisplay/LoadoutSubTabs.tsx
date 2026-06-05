import { CardThemed } from '@genshin-optimizer/common/ui'
import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import type { ElementKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import {
  type OptimizeFlowKind,
  getFlowCharTabPath,
} from '@genshin-optimizer/gi/ui'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import { Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

export function LoadoutSubTabs({
  tab,
  elementKey,
  isTCBuild,
  compact = false,
  flow = 'teams',
  onChange,
}: {
  tab?: string
  elementKey?: ElementKey
  isTCBuild: boolean
  compact?: boolean
  flow?: OptimizeFlowKind
  onChange?: () => void
}) {
  const { t } = useTranslation('page_character')
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const { teamId, teamChar } = useContext(TeamCharacterContext)
  const characterKey = teamChar.key
  const tabPath = (subTab?: string) =>
    getFlowCharTabPath(flow, teamId, characterKey, subTab)

  const tabs = (
    <Tabs
      value={tab ?? 'overview'}
      variant={isXs ? 'scrollable' : compact ? 'scrollable' : 'fullWidth'}
      onChange={onChange}
      allowScrollButtonsMobile
      sx={(theme) => {
        const color = elementKey && theme.palette[elementKey]?.main
        const colorrgb = color && hexToColor(color)
        const colorrbga = (alpha = 1) =>
          (colorrgb && colorToRgbaString(colorrgb, alpha)) ??
          `rgba(255,255,255,${alpha})`
        return {
          minHeight: compact ? 36 : 0,
          position: 'relative',
          '& .MuiTab-root': {
            minHeight: compact ? 36 : 0,
            py: compact ? 0.5 : undefined,
            fontSize: compact ? '0.8rem' : undefined,
            textShadow: compact ? undefined : '#000 0 0 10px !important',
            border: compact ? undefined : `1px solid ${colorrbga(0.3)}`,
          },
          '& .MuiTab-root:hover': compact
            ? undefined
            : {
                transition: 'background-color 0.25s ease',
                backgroundColor: colorrbga(0.1),
                border: `1px solid ${colorrbga(0.8)}`,
              },
          '& .MuiTab-root.Mui-selected': {
            color: `${color} !important`,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: color,
            height: compact ? '3px' : '4px',
          },
        }
      }}
    >
      {isTCBuild ? (
        <Tab
          iconPosition="start"
          value="overview"
          label={t('tabs.theorycraft')}
          icon={<ScienceIcon fontSize={compact ? 'small' : 'medium'} />}
          component={RouterLink}
          to={tabPath()}
        />
      ) : (
        <Tab
          iconPosition="start"
          value="overview"
          label={t('tabs.overview')}
          icon={<PersonIcon fontSize={compact ? 'small' : 'medium'} />}
          component={RouterLink}
          to={tabPath()}
        />
      )}
      <Tab
        iconPosition="start"
        value="talent"
        label={t('tabs.talent')}
        icon={<FactCheckIcon fontSize={compact ? 'small' : 'medium'} />}
        component={RouterLink}
        to={tabPath('talent')}
      />
      {!isTCBuild && (
        <Tab
          iconPosition="start"
          value="optimize"
          label={t('tabs.optimize')}
          icon={<TrendingUpIcon fontSize={compact ? 'small' : 'medium'} />}
          component={RouterLink}
          to={tabPath('optimize')}
        />
      )}
      {!isTCBuild && (
        <Tab
          iconPosition="start"
          value="upopt"
          label={t('tabs.upopt')}
          icon={<UpgradeIcon fontSize={compact ? 'small' : 'medium'} />}
          component={RouterLink}
          to={tabPath('upopt')}
        />
      )}
    </Tabs>
  )

  if (compact) {
    return <CardThemed bgt="light">{tabs}</CardThemed>
  }

  return tabs
}
