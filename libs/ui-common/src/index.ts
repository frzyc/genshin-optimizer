export * from './components/Card/CardThemed'
export * from './components/Card/CardHeaderCustom'
export * from './theme'

declare module '@mui/material/styles' {
  interface Palette {
    contentDark: Palette['primary']
    contentDarker: Palette['primary']
    contentLight: Palette['primary']
  }
}
