'use client'
import { Box, Zoom, useScrollTrigger } from '@mui/material'
import { useMemo } from 'react'

export default function ScrollTop({
  children,
  anchor,
}: {
  anchor: string
  children: React.ReactElement
}) {
  const wind = useMemo(() => {
    if (typeof window !== 'undefined') return window
    return undefined
  }, [])
  const trigger = useScrollTrigger({
    target: wind,
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
