import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ImgIcon,
} from '@genshin-optimizer/common/ui'
import { hexToColor } from '@genshin-optimizer/common/util'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import {
  TeamCharacterContext,
  useCharacter,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import {
  CharacterEditor,
  DataContext,
  SillyContext,
  iconAsset,
  shouldShowDevComponents,
} from '@genshin-optimizer/gi/ui'
import { getLevelString } from '@genshin-optimizer/gi/util'
import { input } from '@genshin-optimizer/gi/wr'

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
  Chip,
  Divider,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Suspense, useContext } from 'react'
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
      <NewTabNav tab={tab} characterKey={characterKey} isTCBuild={isTCBuild} />
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
  const { teamChar, loadoutDatum } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { t } = useTranslation('page_character')
  const { gender } = useDBMeta()
  const elementKey = getCharEle(characterKey)
  const banner = characterAsset(characterKey, 'banner', gender)
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
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
          <BootstrapTooltip
            title={
              teamChar.description ? (
                <Typography>{teamChar.description}</Typography>
              ) : undefined
            }
          >
            <Typography
              variant="h6"
              sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
            >
              <PersonIcon />
              <strong>{teamChar.name}</strong>
              <Divider orientation="vertical" variant="middle" flexItem />
              <CheckroomIcon />
              {database.teams.getActiveBuildName(loadoutDatum)}
            </Typography>
          </BootstrapTooltip>
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

function NewTabNav({
  tab,
  characterKey,
  isTCBuild,
}: {
  tab?: string
  characterKey: CharacterKey
  isTCBuild: boolean
}) {
  const { teamChar, loadoutDatum } = useContext(TeamCharacterContext)
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const { t } = useTranslation('page_character')
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const elementKey = getCharEle(characterKey)
  const character = useCharacter(characterKey)!
  const banner = characterAsset(characterKey, 'bar', gender)
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const tAuto = data.get(input.total.auto).value
  const tSkill = data.get(input.total.skill).value
  const tBurst = data.get(input.total.burst).value
  const characterSheet = getCharSheet(characterKey, gender)
  const [showEditor, onShowEditor, onHideEditor] = useBoolState()
  return (
    <CardThemed
      sx={(theme) => {
        const color = theme.palette[elementKey].main
        console.log({ color })
        const rgb = hexToColor(color)
        const rgbaStr = (o: number) =>
          rgb ? `rgba(${rgb.r}, ${rgb.g},${rgb.b},${o})` : `rgba(0,0,0,0)`

        return {
          display: 'flex',
          position: 'relative',
          boxShadow: elementKey
            ? `0px 0px 0px 0.5px ${color} inset`
            : undefined,
          borderTopLeftRadius: 60,
          borderBottomLeftRadius: 60,
          background: `linear-gradient(to left, ${rgbaStr(
            0.2
          )} 0%, rgba(0,0,0,0) 60%)`,
          marginLeft: '10px',
          overflow: 'visible',
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
            backgroundPosition: 'right',
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'no-repeat',
            transform: 'scaleX(-1)',
          },
          '.MuiChip-root': {
            backgroundColor: 'rgba(100,100,100,0.5)',
            backdropFilter: 'blur(2px)',
          },
        }
      }}
    >
      <CardActionArea
        sx={{ width: 120, height: 120, zIndex: 1 }}
        onClick={onShowEditor}
      >
        <CharacterEditor
          characterKey={showEditor ? characterKey : undefined}
          onClose={onHideEditor}
        />
        <Box
          component="img"
          src={iconAsset(characterKey, gender, silly)}
          sx={{ height: 110, width: 110, margin: '5px', borderRadius: '50%' }}
          zIndex={1}
        />
        <Chip
          label={
            <strong>
              {getLevelString(character.level, character.ascension)}
            </strong>
          }
          size="small"
          sx={{
            position: 'absolute',
            left: -20,
          }}
        />

        <Chip
          size="small"
          icon={
            <ImgIcon
              src={characterSheet.getTalentOfKey('auto')?.img}
              size={1}
            />
          }
          label={<strong>{tAuto}</strong>}
          sx={{
            position: 'absolute',
            left: -20,
            top: 25,
          }}
        />
        <Chip
          size="small"
          icon={
            <ImgIcon
              src={characterSheet.getTalentOfKey('skill')?.img}
              size={1}
            />
          }
          label={<strong>{tSkill}</strong>}
          sx={{
            position: 'absolute',
            left: -20,
            top: 50,
          }}
        />
        <Chip
          size="small"
          icon={
            <ImgIcon
              src={characterSheet.getTalentOfKey('burst')?.img}
              size={1}
            />
          }
          label={<strong>{tBurst}</strong>}
          sx={{
            position: 'absolute',
            left: -10,
            top: 75,
          }}
        />
        <Chip
          label={<strong>C{character.constellation}</strong>}
          size="small"
          sx={{
            position: 'absolute',
            left: -0,
            top: 100,
          }}
        />
      </CardActionArea>

      <Box flexGrow={1} sx={{ minWidth: 0 }}>
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pb: 0,
            textShadow: '#000 0 0 10px !important',
            position: 'relative',
          }}
        >
          <BootstrapTooltip
            title={
              teamChar.description ? (
                <Typography>{teamChar.description}</Typography>
              ) : undefined
            }
          >
            <Typography
              variant="h6"
              sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
            >
              <PersonIcon />
              <strong>{teamChar.name}</strong>
              <Divider orientation="vertical" variant="middle" flexItem />
              <CheckroomIcon />
              {database.teams.getActiveBuildName(loadoutDatum)}
            </Typography>
          </BootstrapTooltip>
        </CardContent>

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

          {!isTCBuild && shouldShowDevComponents && (
            <Tab
              value="upopt"
              label={t('tabs.upgradeopt')}
              icon={<TrendingUpIcon />}
              component={RouterLink}
              to="upopt"
            />
          )}
        </Tabs>
      </Box>
    </CardThemed>
  )
}
