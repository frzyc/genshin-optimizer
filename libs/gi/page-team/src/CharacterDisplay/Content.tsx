import { CardThemed } from '@genshin-optimizer/common/ui'
import { colorToRgbaString, hexToColor } from '@genshin-optimizer/common/util'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext, useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import { Skeleton, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Link as RouterLink, Routes } from 'react-router-dom'
import FormulaModal from './FormulaModal'
import { LoadoutHeader } from './LoadoutHeader'
import TabBuild from './Tabs/TabOptimize'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'
export default function Content({ tab }: { tab?: string }) {
  const {
    loadoutDatum,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const isTCBuild = !!(
    loadoutDatum.buildTcId && loadoutDatum.buildType === 'tc'
  )
  return (
    <>
      <FormulaModal />
      <TabNav tab={tab} characterKey={characterKey} isTCBuild={isTCBuild} />
      <CharacterPanel isTCBuild={isTCBuild} />
      <TabNav
        tab={tab}
        characterKey={characterKey}
        isTCBuild={isTCBuild}
        hideTitle
      />
    </>
  )
}

function CharacterPanel({ isTCBuild }: { isTCBuild: boolean }) {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={500} />}
    >
      <Routes>
        {/* Character Panel */}
        {isTCBuild ? (
          <Route path="" element={<TabTheorycraft />} />
        ) : (
          <Route path="" element={<TabOverview />} />
        )}
        <Route path="talent" element={<TabTalent />} />
        {!isTCBuild && <Route path="optimize" element={<TabBuild />} />}

        {!isTCBuild && <Route path="upopt" element={<TabUpopt />} />}
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </Suspense>
  )
}
function TabNav({
  tab,
  characterKey,
  isTCBuild,
  hideTitle = false,
}: {
  tab?: string
  characterKey: CharacterKey
  isTCBuild: boolean
  hideTitle?: boolean
}) {
  const { gender } = useDBMeta()
  const elementKey = getCharEle(characterKey)
  const banner = characterAsset(characterKey, 'banner', gender)

  return (
    <CardThemed
      sx={(theme) => {
        return {
          position: 'relative',
          boxShadow: elementKey
            ? `0px 0px 0px 1px ${theme.palette[elementKey].main} inset`
            : undefined,
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.3,
            backgroundImage: `url(${banner})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          },
        }
      }}
    >
      {!hideTitle && <LoadoutHeader elementKey={elementKey} />}
      <LoadoutTabs tab={tab} isTCBuild={isTCBuild} elementKey={elementKey} />
    </CardThemed>
  )
}

function LoadoutTabs({
  tab,
  elementKey,
  isTCBuild,
}: {
  tab?: string
  elementKey?: ElementKey
  isTCBuild: boolean
}) {
  const { t } = useTranslation('page_character')
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  return (
    <Tabs
      value={tab ?? 'overview'}
      variant={isXs ? 'scrollable' : 'fullWidth'}
      allowScrollButtonsMobile
      sx={(theme) => {
        const color = elementKey && theme.palette[elementKey]?.main
        const colorrgb = color && hexToColor(color)
        const colorrbga = (alpha = 1) =>
          (colorrgb && colorToRgbaString(colorrgb, alpha)) ??
          `rgba(255,255,255,${alpha})`
        return {
          minHeight: 0,
          position: 'relative',
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.25s ease',
            backgroundColor: colorrbga(0.1),
            border: `1px solid ${colorrbga(0.8)}`,
          },
          '& .MuiTab-root.Mui-selected': {
            color: `${color} !important`,
          },
          '& .MuiTab-root': {
            textShadow: '#000 0 0 10px !important',
            border: `1px solid ${colorrbga(0.3)}`,
            minHeight: 0,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: color,
            height: '4px',
          },
        }
      }}
    >
      {isTCBuild ? (
        <Tab
          iconPosition="start"
          value="overview"
          label={t('tabs.theorycraft')}
          icon={<ScienceIcon />}
          component={RouterLink}
          to=""
        />
      ) : (
        <Tab
          iconPosition="start"
          value="overview"
          label={t('tabs.overview')}
          icon={<PersonIcon />}
          component={RouterLink}
          to=""
        />
      )}
      <Tab
        iconPosition="start"
        value="talent"
        label={t('tabs.talent')}
        icon={<FactCheckIcon />}
        component={RouterLink}
        to="talent"
      />
      {!isTCBuild && (
        <Tab
          iconPosition="start"
          value="optimize"
          label={t('tabs.optimize')}
          icon={<TrendingUpIcon />}
          component={RouterLink}
          to="optimize"
        />
      )}
      {!isTCBuild && (
        <Tab
          iconPosition="start"
          value="upopt"
          label={t('tabs.upopt')}
          icon={<UpgradeIcon />}
          component={RouterLink}
          to="upopt"
        />
      )}
    </Tabs>
  )
}
