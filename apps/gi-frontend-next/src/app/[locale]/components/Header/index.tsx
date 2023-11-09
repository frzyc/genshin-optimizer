'use client'
import { KeyboardArrowUp } from '@mui/icons-material'
import { Fab, useMediaQuery, useTheme } from '@mui/material'
import { usePathname } from 'next/navigation'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'
import ScrollTop from './ScrollTop'
export default function Header({ locale }: { locale: string }) {
  const theme = useTheme()
  const pathname = usePathname()
  const currentTab = pathname.match(/\/.+\/(.+)/)?.[1] ?? ''
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const anchor = 'back-to-top-anchor'
  return (
    <>
      {isMobile ? (
        <MobileHeader anchor={anchor} locale={locale} currentTab={currentTab} />
      ) : (
        <DesktopHeader
          anchor={anchor}
          locale={locale}
          currentTab={currentTab}
        />
      )}
      <ScrollTop anchor={anchor}>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </>
  )
  return
}
