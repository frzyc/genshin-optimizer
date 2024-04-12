import type { CharacterKey } from '@genshin-optimizer/gi/consts'

import FactCheckIcon from '@mui/icons-material/FactCheck'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

import { CardThemed } from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import { TeamCharacterContext, useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { Skeleton, Tab, Tabs } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Link as RouterLink, Routes } from 'react-router-dom'
import FormulaModal from './FormulaModal'
import LoadoutSettingElement from './LoadoutSettingElement'
import TabBuild from './Tabs/TabOptimize'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'

export default function Content({ tab }: { tab: string }) {
  const {
    loadoutDatum,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const isTCBuild = !!(
    loadoutDatum.buildTcId && loadoutDatum.buildType === 'tc'
  )
  const elementKey = getCharEle(characterKey)
  return (
    <>
      <FormulaModal />
      <LoadoutSettingElement
        buttonProps={{
          fullWidth: true,
          color: elementKey ?? 'info',
          variant: 'outlined',
          sx: { backgroundColor: 'contentLight.main' },
        }}
      />

      <TabNav tab={tab} characterKey={characterKey} isTCBuild={isTCBuild} />
      <CharacterPanel isTCBuild={isTCBuild} />
      <TabNav tab={tab} characterKey={characterKey} isTCBuild={isTCBuild} />
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
          <Route path="/*" element={<TabTheorycraft />} />
        ) : (
          <Route path="/*" element={<TabOverview />} />
        )}
        <Route path="/:characterKey/talent" element={<TabTalent />} />
        {!isTCBuild && (
          <Route path="/:characterKey/optimize" element={<TabBuild />} />
        )}

        {!isTCBuild && shouldShowDevComponents && (
          <Route path="/:characterKey/upopt" element={<TabUpopt />} />
        )}
      </Routes>
    </Suspense>
  )
}
function TabNav({
  tab,
  characterKey,
  isTCBuild,
}: {
  tab: string
  characterKey: CharacterKey
  isTCBuild: boolean
}) {
  const { t } = useTranslation('page_character')
  const { gender } = useDBMeta()
  const elementKey = getCharEle(characterKey)
  const banner = characterAsset(characterKey, 'banner', gender)
  return (
    <CardThemed
      bgt="light"
      sx={(theme) => {
        return {
          position: 'relative',
          boxShadow: elementKey
            ? `0px 0px 0px 0.5px ${theme.palette[elementKey].main} inset`
            : undefined,
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.4,
            backgroundImage: `url(${banner})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          },
        }
      }}
    >
      <Tabs
        value={tab}
        variant="fullWidth"
        allowScrollButtonsMobile
        sx={(theme) => {
          return {
            '& .MuiTab-root:hover': {
              transition: 'background-color 0.25s ease',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
            '& .MuiTab-root.Mui-selected': {
              color: 'white !important',
            },
            '& .MuiTab-root': {
              textShadow: '#000 0 0 10px !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: elementKey && theme.palette[elementKey]?.main,
              height: '4px',
            },
          }
        }}
      >
        {isTCBuild ? (
          <Tab
            value="overview"
            label={t('tabs.theorycraft')}
            icon={<ScienceIcon />}
            component={RouterLink}
            to={`${characterKey}/`}
          />
        ) : (
          <Tab
            value="overview"
            label={t('tabs.overview')}
            icon={<PersonIcon />}
            component={RouterLink}
            to={`${characterKey}/`}
          />
        )}
        <Tab
          value="talent"
          label={t('tabs.talent')}
          icon={<FactCheckIcon />}
          component={RouterLink}
          to={`${characterKey}/talent`}
        />
        {!isTCBuild && (
          <Tab
            value="optimize"
            label={t('tabs.optimize')}
            icon={<TrendingUpIcon />}
            component={RouterLink}
            to={`${characterKey}/optimize`}
          />
        )}

        {!isTCBuild && shouldShowDevComponents && (
          <Tab
            value="upopt"
            label={t('tabs.upgradeopt')}
            icon={<TrendingUpIcon />}
            component={RouterLink}
            to={`${characterKey}/upopt`}
          />
        )}
      </Tabs>
    </CardThemed>
  )
}
