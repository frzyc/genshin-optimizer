import type { SvgIconProps } from '@mui/material';
import { SvgIcon } from '@mui/material'

export const IceIcon = (props: SvgIconProps) => (
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
          id="zzz_ice_gradient"
          gradientUnits="userSpaceOnUse"
          x1="12.046218"
          y1="318.507874"
          x2="12.046218"
          y2="331.878662"
          gradientTransform="matrix(1.542268,0,0,1.542268,-6.672988,-489.629329)"
        >
          <stop
            offset="0"
            style={{
              stopColor: 'rgb(1.568627%,76.078431%,78.431373%)',
              stopOpacity: 1,
            }}
          />
          <stop
            offset="1"
            style={{
              stopColor: 'rgb(51.372549%,95.686275%,94.117647%)',
              stopOpacity: 1,
            }}
          />
        </linearGradient>
      </defs>
      <g id="surface1">
        <path
          style={{
            stroke: 'none',
            fillRule: 'nonzero',
            fill: 'url(#zzz_ice_gradient)',
          }}
          d="M 11.90625 0 L 8.785156 6.503906 L 1.59375 5.953125 L 5.667969 11.90625 L 1.59375 17.859375 L 8.785156 17.308594 L 11.90625 23.8125 L 15.023438 17.308594 L 22.214844 17.859375 L 18.144531 11.90625 L 22.214844 5.953125 L 15.023438 6.503906 Z M 8.8125 8.605469 L 11.90625 10.1875 L 14.898438 8.632812 L 13.625 11.90625 L 15.179688 14.898438 L 11.90625 13.628906 L 8.914062 15.183594 L 10.183594 11.90625 L 8.628906 8.914062 Z M 8.8125 8.605469 "
        />
      </g>
    </svg>
  </SvgIcon>
)
