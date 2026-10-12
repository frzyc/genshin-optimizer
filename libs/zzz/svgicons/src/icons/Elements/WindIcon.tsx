import type { SvgIconProps } from '@mui/material'
import { SvgIcon } from '@mui/material'

export const WindIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
    >
      <defs>
        <linearGradient
          id="zzz_wind_gradient"
          gradientUnits="userSpaceOnUse"
          x1="1862.372"
          x2="1908.889"
          y1="1828.644"
          y2="1900.273"
        >
          <stop offset="0" style={{ stopColor: '#61a3ff', stopOpacity: 1 }} />
          <stop offset="1" style={{ stopColor: '#97e3fa', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g id="surface1">
        <path
          d="M 1870.45 1829 q 10.4 -0.95 17.85 0.6 q 6.65 1.4 10.4 4.6 q -12.85 -5.45 -27.25 -1.45 q -15.65 4.35 -24.5 18.15 q -5.25 8.15 -3.65 18.25 q 2 -7.9 6.4 -13.65 q 4.9 -6.45 12.35 -9.65 q -23.2 18.7 -11.3 39.95 q 7.95 14.1 25.85 16.75 q 16.85 2.45 29.45 -6.4 q -13.55 1.95 -22.2 0.05 q -10.3 -2.25 -16.55 -10.35 q 9.2 7.1 22 6.35 q 11.7 -0.7 22.2 -7.5 q 10.55 -6.85 14.7 -16.65 q 4.55 -10.75 -0.6 -21.1 q -0.789 17.455 -14.05 25 q 9.75 -10.45 9.55 -20.85 q -0.2 -9.35 -8.05 -16.3 q -7.6 -6.65 -19.1 -8.4 q -12.1 -1.9 -23.5 2.6 m 26.35 43.15 q -7.2 5.35 -15.8 5.35 q -8.55 0 -13.55 -5.35 q -4.9 -5.4 -3.25 -12.9 q 1.65 -7.55 8.95 -13 q 7.25 -5.3 15.85 -5.3 q 8.55 0 13.45 5.3 q 5 5.45 3.35 13 q -1.65 7.5 -9 12.9"
          style={{
            stroke: 'none',
            fillRule: 'nonzero',
            fill: 'url(#zzz_wind_gradient)',
          }}
          transform="matrix(0.27855, 0, 0, 0.27855, -513.226, -507.406)"
        />
      </g>
    </svg>
  </SvgIcon>
)
