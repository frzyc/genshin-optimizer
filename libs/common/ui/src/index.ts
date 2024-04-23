export * from './components'
export * from './context'
export * from './hooks'
export * from './theme'

declare module '@mui/material/styles' {
  interface Palette {
    contentDark: Palette['primary']
    contentDarker: Palette['primary']
    contentLight: Palette['primary']
  }
}
