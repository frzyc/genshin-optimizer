'use client'
import { SillyContext } from '@genshin-optimizer/gi-ui-next'
import {
  AppBar,
  Avatar,
  Box,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { maincontent } from './TabsData'
import silly_icon from './silly_icon.png'

export default function DesktopHeader({
  anchor,
  locale,
  currentTab,
}: {
  anchor: string
  locale: string
  currentTab: string
}) {
  const theme = useTheme()
  const { t } = useTranslation('ui')
  const { silly } = useContext(SillyContext)
  const isXL = useMediaQuery(theme.breakpoints.up('xl'))

  return (
    <AppBar position="static" id={anchor} sx={{ bgcolor: '#343a40' }}>
      <Tabs
        value={currentTab}
        sx={{
          '& .MuiTab-root': {
            p: 1,
            minWidth: 'auto',
            minHeight: 'auto',
          },
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.5s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Tab
          component={Link}
          value={''}
          href={`/`}
          label={
            silly ? (
              <Box display="flex" alignItems="center">
                <Avatar src={silly_icon.src} />
                <Typography variant="h6" sx={{ px: 1 }}>
                  {t('sillyPageTitle')}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ px: 1 }}>
                {t('pageTitle')}
              </Typography>
            )
          }
        />
        {maincontent.map(({ i18Key, value, to, icon, textSuffix }) => {
          const tooltipIcon = isXL ? (
            icon
          ) : (
            <Tooltip arrow title={t(i18Key)}>
              {icon as JSX.Element}
            </Tooltip>
          )
          return (
            <Tab
              key={value}
              value={value}
              component={Link}
              href={to(locale)}
              icon={tooltipIcon}
              iconPosition="start"
              label={
                isXL || textSuffix ? (
                  <Box display="flex" gap={1} alignItems="center">
                    {isXL && <span>{t(i18Key)}</span>}
                    {textSuffix}
                  </Box>
                ) : undefined
              }
              sx={{ ml: value === 'login' ? 'auto' : undefined }}
            />
          )
        })}
      </Tabs>
    </AppBar>
  )
}
