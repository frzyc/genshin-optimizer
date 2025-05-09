import { Box } from '@mui/system'
import type { MouseEventHandler } from 'react'

/**
 * Cheeky facsimile of the weird triangle and close icon on the top right of ads
 */
export function AdButtons({ onClose }: { onClose: MouseEventHandler }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        height: '1em',
        stroke: '#00aecd',
        fill: '#00aecd',
        right: 2,
        top: 2,
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 15 15"
        height="1em"
      >
        <circle cx="6" cy="6" r="0.67"></circle>
        <path
          strokeWidth={0}
          d="M4.2,11.3Q3.3,11.8,3.3,10.75L3.3,4.1Q3.3,3.1,4.3,3.5L10.4,7.0Q12.0,7.5,10.4,8.0L6.65,10.0L6.65,7.75a0.65,0.65,0,1,0,-1.3,0L5.35,10.75a0.9,0.9,0,0,0,1.3,0.8L12.7,8.2Q13.7,7.5,12.7,6.7L3.3,1.6Q2.2,1.3,1.8,2.5L1.8,12.5Q2.2,13.9,3.3,13.3L4.8,12.5A0.3,0.3,0,1,0,4.2,11.3Z"
        ></path>
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 15 15"
        height="1em"
      >
        <path
          height="15px"
          width="15px"
          strokeWidth={1.25}
          d="M3.25,3.25l8.5,8.5M11.75,3.25l-8.5,8.5"
        ></path>
      </svg>
    </Box>
  )
}
