import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  BarChart,
  Calculate,
  FactCheck,
  Groups,
  Person,
  Science,
  TrendingUp,
} from '@mui/icons-material'
import { Box, Button, Skeleton, Tab, Tabs } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Link as RouterLink, Routes } from 'react-router-dom'
import CardLight from '../../Components/Card/CardLight'
import CloseButton from '../../Components/CloseButton'
import {
  HitModeToggle,
  InfusionAuraDropdown,
  ReactionToggle,
} from '../../Components/HitModeEditor'
import SqBadge from '../../Components/SqBadge'
import { FormulaDataContext } from '../../Context/FormulaDataContext'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
import { shouldShowDevComponents } from '../../Util/Util'
import { CustomMultiTargetButton } from './CustomMultiTarget'
import FormulaModal from './FormulaModal'
import BuildEditorBtn from './Build/BuildEditorBtn'
import StatModal from './StatModal'
import TabBuild from './Tabs/TabOptimize'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTeambuffs from './Tabs/TabTeambuffs'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'

export default function Content({
  tab,
  onClose,
}: {
  tab: string
  onClose?: () => void
}) {
  const {
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  return (
    <>
      <Box display="flex">
        <Box display="flex" gap={1} flexWrap="wrap" flexGrow={1}>
          <BuildEditorBtn />
          <DetailStatButton />
          <CustomMultiTargetButton />
          <FormulasButton />
        </Box>
        {!!onClose && <CloseButton onClick={onClose} />}
      </Box>
      <Box display="flex" gap={1} flexWrap="wrap">
        <HitModeToggle size="small" />
        <InfusionAuraDropdown />
        <ReactionToggle size="small" />
      </Box>
      <CardLight>
        <TabNav tab={tab} characterKey={characterKey} />
      </CardLight>
      <CharacterPanel />
      <CardLight>
        <TabNav tab={tab} characterKey={characterKey} />
      </CardLight>
    </>
  )
}

function CharacterPanel() {
  const {
    teamChar: { buildType, buildTcId },
  } = useContext(TeamCharacterContext)
  const isTCBuild = buildTcId && buildType === 'tc'
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={500} />}
    >
      <Routes>
        {/* Character Panel */}
        {isTCBuild ? (
          <Route path="/:characterKey/*" element={<TabTheorycraft />} />
        ) : (
          <Route path="/:characterKey/*" element={<TabOverview />} />
        )}
        <Route path="/:characterKey/talent" element={<TabTalent />} />
        <Route path="/:characterKey/teambuffs" element={<TabTeambuffs />} />
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
}: {
  tab: string
  characterKey: CharacterKey
}) {
  const { t } = useTranslation('page_character')
  const {
    teamChar: { buildType, buildTcId },
  } = useContext(TeamCharacterContext)
  const isTCBuild = buildTcId && buildType === 'tc'
  return (
    <Tabs
      value={tab}
      variant="fullWidth"
      allowScrollButtonsMobile
      sx={{
        '& .MuiTab-root:hover': {
          transition: 'background-color 0.25s ease',
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
      }}
    >
      {isTCBuild ? (
        <Tab
          value="overview"
          label={t('tabs.theorycraft')}
          icon={<Science />}
          component={RouterLink}
          to={`${characterKey}/`}
        />
      ) : (
        <Tab
          value="overview"
          label={t('tabs.overview')}
          icon={<Person />}
          component={RouterLink}
          to={`${characterKey}/`}
        />
      )}
      <Tab
        value="talent"
        label={t('tabs.talent')}
        icon={<FactCheck />}
        component={RouterLink}
        to={`${characterKey}/talent`}
      />
      <Tab
        value="teambuffs"
        label={t('tabs.teambuffs')}
        icon={<Groups />}
        component={RouterLink}
        to={`${characterKey}/teambuffs`}
      />
      {!isTCBuild && (
        <Tab
          value="optimize"
          label={t('tabs.optimize')}
          icon={<TrendingUp />}
          component={RouterLink}
          to={`${characterKey}/optimize`}
        />
      )}

      {!isTCBuild && shouldShowDevComponents && (
        <Tab
          value="upopt"
          label={t('tabs.upgradeopt')}
          icon={<TrendingUp />}
          component={RouterLink}
          to={`${characterKey}/upopt`}
        />
      )}
    </Tabs>
  )
}

function DetailStatButton() {
  const { t } = useTranslation('page_character')
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamChar: { bonusStats },
  } = useContext(TeamCharacterContext)
  const bStatsNum = Object.keys(bonusStats).length
  return (
    <>
      <Button color="info" startIcon={<BarChart />} onClick={onOpen}>
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
function FormulasButton() {
  const { onModalOpen } = useContext(FormulaDataContext)
  return (
    <>
      <Button color="info" startIcon={<Calculate />} onClick={onModalOpen}>
        Formulas {'&'} Calcs
      </Button>
      <FormulaModal />
    </>
  )
}
