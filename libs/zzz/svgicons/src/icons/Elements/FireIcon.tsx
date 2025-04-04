import type { SvgIconProps } from '@mui/material'
import { SvgIcon } from '@mui/material'

export const FireIcon = (props: SvgIconProps) => (
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
          id="zzz_fire_gradient"
          gradientUnits="userSpaceOnUse"
          x1="12.181757"
          y1="302.12439"
          x2="12.181757"
          y2="315.03009"
          gradientTransform="matrix(1.662704,0,0,1.662704,-8.349158,-501.16705)"
        >
          <stop
            offset="0"
            style={{
              stopColor: 'rgb(91.764706%,8.235294%,1.176471%)',
              stopOpacity: 1,
            }}
          />
          <stop
            offset="1"
            style={{
              stopColor: 'rgb(95.294118%,45.490196%,10.196078%)',
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
            fill: 'url(#zzz_fire_gradient)',
          }}
          d="M 3.351562 20.316406 C 5.246094 22.136719 8.453125 22.550781 10.78125 23.761719 C 10.796875 20.796875 9.007812 17.742188 5.410156 17.203125 C 8.976562 16.40625 10.683594 15.003906 11.644531 10.925781 C 12.617188 15.554688 14.792969 16.398438 18.292969 17.179688 C 14.738281 17.816406 12.480469 20.0625 12.921875 23.8125 C 15.558594 22.441406 19.085938 21.617188 21.019531 19.257812 C 24.617188 14.871094 21.757812 7.753906 16.816406 5.820312 C 18.429688 9.757812 13.664062 9.335938 13.238281 5.183594 C 13.039062 3.246094 15.113281 1.6875 16.617188 0.800781 C 13.335938 -1.15625 6.816406 0.6875 7.214844 4.023438 C 7.539062 6.746094 9.796875 9.75 6.953125 10.429688 C 4.035156 11.125 4.910156 6.851562 4.910156 6.851562 C 1.128906 8.605469 -0.433594 16.667969 3.351562 20.316406 Z M 3.351562 20.316406 "
        />
      </g>
    </svg>
  </SvgIcon>
)
