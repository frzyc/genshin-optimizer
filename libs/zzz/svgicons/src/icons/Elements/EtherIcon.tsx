import { createSvgIcon } from '@mui/material'

export const EtherIcon = createSvgIcon(
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    version="1.1"
  >
    <defs>
      <linearGradient
        id="zzz_ether_gradient"
        gradientUnits="userSpaceOnUse"
        x1="16.461201"
        y1="354.588898"
        x2="7.359526"
        y2="367.587433"
        gradientTransform="matrix(1.418018,0,0,1.418018,-4.983589,-500.123885)"
      >
        <stop
          offset="0"
          style={{
            stopColor: 'rgb(100%,3.921569%,10.196078%)',
            stopOpacity: 1,
          }}
        />
        <stop
          offset="0.171206"
          style={{
            stopColor: 'rgb(100%,2.352941%,14.901961%)',
            stopOpacity: 1,
          }}
        />
        <stop
          offset="0.5"
          style={{
            stopColor: 'rgb(70.196078%,21.960784%,86.666667%)',
            stopOpacity: 1,
          }}
        />
        <stop
          offset="0.85"
          style={{
            stopColor: 'rgb(16.470588%,41.960784%,91.764706%)',
            stopOpacity: 1,
          }}
        />
        <stop
          offset="1"
          style={{
            stopColor: 'rgb(16.470588%,41.960784%,91.764706%)',
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
          fill: 'url(#zzz_ether_gradient)',
        }}
        d="M 11.089844 0 L 8.566406 6.320312 C 8.277344 7.046875 7.699219 7.621094 6.972656 7.910156 L 0.65625 10.433594 L 6.972656 12.957031 C 7.691406 13.242188 8.234375 13.847656 8.449219 14.589844 L 11.089844 23.8125 L 13.730469 14.589844 C 13.941406 13.847656 14.488281 13.242188 15.203125 12.957031 L 21.523438 10.433594 L 15.203125 7.910156 C 14.476562 7.621094 13.902344 7.046875 13.613281 6.320312 Z M 18.859375 13.316406 L 17.886719 15.703125 C 17.714844 16.132812 17.375 16.46875 16.945312 16.644531 L 14.558594 17.613281 L 16.945312 18.585938 C 17.375 18.757812 17.714844 19.097656 17.886719 19.527344 L 18.859375 21.914062 L 19.828125 19.527344 C 20 19.097656 20.339844 18.757812 20.769531 18.585938 L 23.15625 17.613281 L 20.769531 16.644531 C 20.339844 16.46875 20 16.132812 19.828125 15.703125 Z M 18.859375 13.316406 "
      />
    </g>
  </svg>,
  'Ether'
)
