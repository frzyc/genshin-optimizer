import { BootstrapTooltip, CardThemed, ModalWrapper, TextFieldLazy } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import {
  Box,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Suspense, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Link as RouterLink, Routes } from 'react-router-dom'
import FormulaModal from './FormulaModal'
import LoadoutSettingElement from './LoadoutSettingElement'
import TabBuild from './Tabs/TabOptimize'
import TabOverview from './Tabs/TabOverview'
import TabTalent from './Tabs/TabTalent'
import TabTheorycraft from './Tabs/TabTheorycraft'
import TabUpopt from './Tabs/TabUpgradeOpt'
import CloseIcon from '@mui/icons-material/Close'
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
        <Route path="" index element={<LoadoutSettingElement />} />
        {/* Character Panel */}
        {isTCBuild ? (
          <Route path="theorycraft" element={<TabTheorycraft />} />
        ) : (
          <Route path="overview" element={<TabOverview />} />
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
  const { teamChar, loadoutDatum, teamCharId } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { t } = useTranslation('page_character')
  const { gender } = useDBMeta()
  const elementKey = getCharEle(characterKey)
  const banner = characterAsset(characterKey, 'banner', gender)
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [editMode, setEditMode] = useState(false)
  const [loadoutName, setloadoutName] = useState(teamChar.name)
  const [loudoutDesc, setloadoutDesc] = useState(teamChar.description)
  const handleName = (loadoutName: string): void => {
    setloadoutName(loadoutName)
    database.teamChars.set(teamCharId, { name: loadoutName})
  }

  const handleDesc = (loudoutDesc: string): void => {
    setloadoutDesc(loudoutDesc)
    database.teamChars.set(teamCharId, { description: loudoutDesc})
  }

  return (
    <CardThemed
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
      {!hideTitle && (
          <CardContent
            sx={{
              display: 'flex',
              justifyContent: 'center',
              pb: 0,
              textShadow: '#000 0 0 10px !important',
              position: 'relative',
            }}
          >
            <CardActionArea onClick={() => setEditMode(true)}>
              <BootstrapTooltip
                title={
                  teamChar.description ? (
                    <Typography>{teamChar.description}</Typography>
                  ) : undefined
                }
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <PersonIcon />
                  <strong>{teamChar.name}</strong>
                  <Divider orientation="vertical" variant="middle" flexItem />
                  <CheckroomIcon />
                  {database.teams.getActiveBuildName(loadoutDatum)}
                </Typography>
              </BootstrapTooltip>
            </CardActionArea>
            <ModalWrapper open={editMode} onClose={() => setEditMode(false)}>
              <CardThemed>
                <CardHeader
                  title="Edit Loadout"
                  action={
                    <IconButton onClick={() => setEditMode(false)}>
                      <CloseIcon />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    sx={{ mt: 2 }}
                  >
                    <TextFieldLazy
                      label="Loadout Name"
                      placeholder='Loadout Name'
                      value={teamChar.name}
                      onChange={(loadoutName) => handleName(loadoutName)}
                      autoFocus
                    />
                    <TextFieldLazy
                      label="Loadout Description"
                      placeholder='Loadout Description'
                      value={teamChar.description}
                      onChange={(loadoutDesc) => handleDesc(loadoutDesc)}
                      multiline
                      minRows={4}
                    />
                  </Box>
                </CardContent>
              </CardThemed>
            </ModalWrapper>
          </CardContent>
      )}
      <Tabs
        value={tab ?? 'setting'}
        variant={isXs ? 'scrollable' : 'fullWidth'}
        allowScrollButtonsMobile
        sx={(theme) => {
          return {
            position: 'relative',
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
        <Tab
          value="setting"
          label={t('tabs.setting')}
          icon={<CheckroomIcon />}
          component={RouterLink}
          to=""
        />
        {isTCBuild ? (
          <Tab
            value="theorycraft"
            label={t('tabs.theorycraft')}
            icon={<ScienceIcon />}
            component={RouterLink}
            to="theorycraft"
          />
        ) : (
          <Tab
            value="overview"
            label={t('tabs.overview')}
            icon={<PersonIcon />}
            component={RouterLink}
            to="overview"
          />
        )}
        <Tab
          value="talent"
          label={t('tabs.talent')}
          icon={<FactCheckIcon />}
          component={RouterLink}
          to="talent"
        />
        {!isTCBuild && (
          <Tab
            value="optimize"
            label={t('tabs.optimize')}
            icon={<TrendingUpIcon />}
            component={RouterLink}
            to="optimize"
          />
        )}
        {!isTCBuild && (
          <Tab
            value="upopt"
            label={t('tabs.upgradeopt')}
            icon={<UpgradeIcon />}
            component={RouterLink}
            to="upopt"
          />
        )}
      </Tabs>
    </CardThemed>
  )
}
