import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
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
import LevelSelect from '../../Components/LevelSelect'
import SqBadge from '../../Components/SqBadge'
import { CharacterContext } from '../../Context/CharacterContext'
import { FormulaDataContext } from '../../Context/FormulaDataContext'
import useCharacterReducer from '../../ReactHooks/useCharacterReducer'
import { shouldShowDevComponents } from '../../Util/Util'
import CharSelectButton from './CharSelectButton'
import { CustomMultiTargetButton } from './CustomMultiTarget'
import FormulaModal from './FormulaModal'
import StatModal from './StatModal'
import TabBuild from './Tabs/TabOptimize'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTeambuffs from './Tabs/TabTeambuffs'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'
import TravelerElementSelect from './TravelerElementSelect'
import TravelerGenderSelect from './TravelerGenderSelect'

export default function Content({
  character,
  tab,
  onClose,
}: {
  character: ICachedCharacter
  tab: string
  onClose?: () => void
}) {
  const characterDispatch = useCharacterReducer(character?.key ?? '')
  return (
    <>
      <Box display="flex">
        <Box display="flex" gap={1} flexWrap="wrap" flexGrow={1}>
          <CharSelectButton />
          <TravelerElementSelect />
          <TravelerGenderSelect />
          <DetailStatButton />
          <CustomMultiTargetButton />
          <FormulasButton />
        </Box>
        {!!onClose && <CloseButton onClick={onClose} />}
      </Box>
      <Box display="flex" gap={1} flexWrap="wrap">
        {character && (
          <LevelSelect
            level={character.level}
            ascension={character.ascension}
            setBoth={characterDispatch}
          />
        )}
        <HitModeToggle size="small" />
        <InfusionAuraDropdown />
        <ReactionToggle size="small" />
      </Box>
      <CardLight>
        <TabNav tab={tab} />
      </CardLight>
      <CharacterPanel />
      <CardLight>
        <TabNav tab={tab} />
      </CardLight>
    </>
  )
}

function CharacterPanel() {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={500} />}
    >
      <Routes>
        {/* Character Panel */}
        <Route index element={<TabOverview />} />
        <Route path="/talent" element={<TabTalent />} />
        <Route path="/teambuffs" element={<TabTeambuffs />} />
        <Route path="/optimize" element={<TabBuild />} />
        <Route path="/theorycraft" element={<TabTheorycraft />} />
        {shouldShowDevComponents && (
          <Route path="/upopt" element={<TabUpopt />} />
        )}
      </Routes>
    </Suspense>
  )
}
function TabNav({ tab }: { tab: string }) {
  const { t } = useTranslation('page_character')
  const tabSx = shouldShowDevComponents
    ? { minWidth: '16.6%' }
    : { minWidth: '20%' }
  return (
    <Tabs
      value={tab}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{
        '& .MuiTab-root:hover': {
          transition: 'background-color 0.25s ease',
          backgroundColor: 'rgba(255,255,255,0.1)',
        },
      }}
    >
      <Tab
        sx={tabSx}
        value="overview"
        label={t('tabs.overview')}
        icon={<Person />}
        component={RouterLink}
        to=""
      />
      <Tab
        sx={tabSx}
        value="talent"
        label={t('tabs.talent')}
        icon={<FactCheck />}
        component={RouterLink}
        to="talent"
      />
      <Tab
        sx={tabSx}
        value="teambuffs"
        label={t('tabs.teambuffs')}
        icon={<Groups />}
        component={RouterLink}
        to="teambuffs"
      />
      <Tab
        sx={tabSx}
        value="optimize"
        label={t('tabs.optimize')}
        icon={<TrendingUp />}
        component={RouterLink}
        to="optimize"
      />
      <Tab
        sx={tabSx}
        value="theorycraft"
        label={t('tabs.theorycraft')}
        icon={<Science />}
        component={RouterLink}
        to="theorycraft"
      />
      {shouldShowDevComponents && (
        <Tab
          sx={tabSx}
          value="upopt"
          label={t('tabs.upgradeopt')}
          icon={<TrendingUp />}
          component={RouterLink}
          to="upopt"
        />
      )}
    </Tabs>
  )
}

function DetailStatButton() {
  const { t } = useTranslation('page_character')
  const [open, onOpen, onClose] = useBoolState()
  const {
    character: { bonusStats },
  } = useContext(CharacterContext)
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
