'use client'
import { KeyboardArrowUp } from '@mui/icons-material'
import {
  Box,
  Fab,
  Zoom,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from '@mui/material'
import { usePathname } from 'next/navigation'
import DesktopHeader from './DesktopHeader'
import MobileHeader from './MobileHeader'
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

function ScrollTop({
  children,
  anchor,
}: {
  anchor: string
  children: React.ReactElement
}) {
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100,
  })

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchorElement = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector(`#${anchor}`)

    if (anchorElement) {
      anchorElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 85, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  )
}
