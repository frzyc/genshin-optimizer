import { AnvilIcon } from '@genshin-optimizer/common/svgicons'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { FlowerIcon } from '@genshin-optimizer/gi/svgicons'
import { People } from '@mui/icons-material'
import { Divider, Skeleton, Tab, Tabs } from '@mui/material'
import type { ReactElement } from 'react'
import { Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Navigate,
  Route,
  Link as RouterLink,
  Routes,
  useMatch,
} from 'react-router-dom'
import TabArtifact from './TabArtifact'
import TabCharacter from './TabCharacter'
import TabWeapon from './TabWeapon'
type TabInfo = {
  i18Key: string
  icon: ReactElement
  value: string
  to: string
}
const artifacts: TabInfo = {
  i18Key: 'tabs.artifacts',
  icon: <FlowerIcon />,
  value: 'artifacts',
  to: '/artifacts',
}
const weapons: TabInfo = {
  i18Key: 'tabs.weapons',
  icon: <AnvilIcon />,
  value: 'weapons',
  to: '/weapons',
}

const characters: TabInfo = {
  i18Key: 'tabs.characters',
  icon: <People />,
  value: 'characters',
  to: '/characters',
}

const tabs = [artifacts, weapons, characters] as const
const tabValues = tabs.map(({ value }) => value)
export default function PageArchive() {
  const { t } = useTranslation('ui')

  const {
    params: { tab: tabRaw },
  } = useMatch({ path: '/archive/:tab', end: false }) ?? {
    params: {},
  }
  const tab = useMemo(() => {
    const tab = tabValues.find((tv) => tv === tabRaw)
    return tab ?? 'artifacts'
  }, [tabRaw])

  return (
    <CardThemed>
      <Tabs
        variant="fullWidth"
        value={tab}
        sx={{
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.25s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '& .Mui-selected': {
            color: 'white !important',
          },
          '& .MuiTabs-indicator': {
            height: '4px',
          },
        }}
      >
        {tabs.map(({ i18Key, icon, value, to }) => {
          return (
            <Tab
              icon={icon}
              iconPosition="start"
              value={value}
              key={value}
              label={t(i18Key)}
              component={RouterLink}
              to={`/archive${to}`}
            />
          )
        })}
      </Tabs>
      <Divider />
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        <Routes>
          <Route path="artifacts" element={<TabArtifact />} />
          <Route path="weapons" element={<TabWeapon />} />
          <Route path="characters" element={<TabCharacter />} />
          <Route path="*" element={<Navigate to="artifacts" replace />} />
        </Routes>
      </Suspense>
    </CardThemed>
  )
}
