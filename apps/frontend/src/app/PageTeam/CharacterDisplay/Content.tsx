import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'

import BarChartIcon from '@mui/icons-material/BarChart'
import CalculateIcon from '@mui/icons-material/Calculate'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

import { CardThemed } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import type { ButtonProps } from '@mui/material'
import { Box, Button, Skeleton, Tab, Tabs } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Link as RouterLink, Routes } from 'react-router-dom'
import SqBadge from '../../Components/SqBadge'
import { FormulaDataContext } from '../../Context/FormulaDataContext'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
import { shouldShowDevComponents } from '../../Util/Util'
import { CustomMultiTargetButton } from './CustomMultiTarget'
import FormulaModal from './FormulaModal'
import LoadoutSettingElement from './LoadoutSettingElement'
import StatModal from './StatModal'
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
  const elementKey = getCharData(characterKey).ele
  return (
    <>
      <LoadoutSettingElement
        buttonProps={{
          fullWidth: true,
          color: elementKey ?? 'info',
          variant: 'outlined',
          sx: { backgroundColor: 'contentLight.main' },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <DetailStatButton
          buttonProps={{
            sx: { flexGrow: 1, backgroundColor: 'contentLight.main' },
            color: elementKey ?? 'info',
            variant: 'outlined',
          }}
        />
        <CustomMultiTargetButton
          buttonProps={{
            sx: { flexGrow: 1, backgroundColor: 'contentLight.main' },
            color: elementKey ?? 'info',
            variant: 'outlined',
          }}
        />
        <FormulasButton
          buttonProps={{
            sx: { flexGrow: 1, backgroundColor: 'contentLight.main' },
            color: elementKey ?? 'info',
            variant: 'outlined',
          }}
        />
      </Box>
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
  const elementKey = getCharData(characterKey).ele
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

function DetailStatButton({ buttonProps = {} }: { buttonProps?: ButtonProps }) {
  const { t } = useTranslation('page_character')
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamChar: { bonusStats },
  } = useContext(TeamCharacterContext)
  const bStatsNum = Object.keys(bonusStats).length
  return (
    <>
      <Button
        color="info"
        startIcon={<BarChartIcon />}
        onClick={onOpen}
        {...buttonProps}
      >
        {t`addStats.title`}
        {!!bStatsNum && (
          <SqBadge sx={{ ml: 1 }} color="success">
            {bStatsNum}
          </SqBadge>
        )}
      </Button>
      <StatModal open={open} onClose={onClose} />
    </>
  )
}
function FormulasButton({ buttonProps = {} }: { buttonProps?: ButtonProps }) {
  const { onModalOpen } = useContext(FormulaDataContext)
  return (
    <>
      <Button
        color="info"
        startIcon={<CalculateIcon />}
        onClick={onModalOpen}
        {...buttonProps}
      >
        Formulas {'&'} Calcs
      </Button>
      <FormulaModal />
    </>
  )
}
