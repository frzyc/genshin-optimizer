import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import { LoadoutIcon } from '@genshin-optimizer/gi/ui'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
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
  const { teamChar, loadoutDatum, teamCharId } =
    useContext(TeamCharacterContext)
  const database = useDatabase()
  const { t } = useTranslation('page_team')
  const { gender } = useDBMeta()
  const elementKey = getCharEle(characterKey)
  const banner = characterAsset(characterKey, 'banner', gender)

  const [editMode, setEditMode] = useState(false)
  const [, setloadoutName] = useState(teamChar.name)
  const [, setloadoutDesc] = useState(teamChar.description)
  const handleName = (loadoutName: string): void => {
    setloadoutName(loadoutName)
    database.teamChars.set(teamCharId, { name: loadoutName })
  }

  const handleDesc = (loudoutDesc: string): void => {
    setloadoutDesc(loudoutDesc)
    database.teamChars.set(teamCharId, { description: loudoutDesc })
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
        <>
          <CardActionArea onClick={() => setEditMode(true)}>
            <BootstrapTooltip
              placement="top"
              title={
                <Box>
                  <Box sx={{ display: 'flex', color: 'info.light', gap: 1 }}>
                    <BorderColorIcon />
                    <Typography>
                      <strong>{t`loadout.editNameDesc`}</strong>
                    </Typography>
                  </Box>
                  {!!teamChar.description && (
                    <Typography>{teamChar.description}</Typography>
                  )}
                </Box>
              }
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  '&:hover': {
                    color: 'info.light',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    textShadow: '#000 0 0 10px !important',
                  }}
                >
                  <PersonIcon />
                  <strong>{teamChar.name}</strong>
                  <Divider orientation="vertical" variant="middle" flexItem />
                  <CheckroomIcon />
                  {database.teams.getActiveBuildName(loadoutDatum)}
                </Typography>
              </CardContent>
            </BootstrapTooltip>
          </CardActionArea>
          <ModalWrapper open={editMode} onClose={() => setEditMode(false)}>
            <CardThemed>
              <CardHeader
                title={t`loadout.editNameDesc`}
                avatar={<LoadoutIcon />}
                titleTypographyProps={{ variant: 'h6' }}
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
                    label={t`loadout.name`}
                    value={teamChar.name}
                    onChange={handleName}
                    autoFocus
                  />
                  <TextFieldLazy
                    label={t`loadout.desc`}
                    value={teamChar.description}
                    onChange={handleDesc}
                    multiline
                    minRows={4}
                  />
                </Box>
              </CardContent>
            </CardThemed>
          </ModalWrapper>
          <Divider />
        </>
      )}
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
          label={t('tabs.upopt')}
          icon={<UpgradeIcon />}
          component={RouterLink}
          to="upopt"
        />
      )}
    </Tabs>
  )
}
