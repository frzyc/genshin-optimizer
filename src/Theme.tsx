import { createTheme, darkScrollbar } from "@mui/material";

declare module '@mui/material/styles' {

  interface Palette {
    warning: Palette['primary'];
    contentDark: Palette['primary'];
    contentDarker: Palette['primary'];
    contentLight: Palette['primary'];
    roll1: Palette['primary'];
    roll2: Palette['primary'];
    roll3: Palette['primary'];
    roll4: Palette['primary'];
    roll5: Palette['primary'];
    roll6: Palette['primary'];
    geo: Palette['primary'];
    dendro: Palette['primary'];
    pyro: Palette['primary'];
    hydro: Palette['primary'];
    cryo: Palette['primary'];
    electro: Palette['primary'];
    anemo: Palette['primary'];
    physical: Palette['primary'];
    vaporize: Palette['primary'];
    melt: Palette['primary'];
    overloaded: Palette['primary'];
    superconduct: Palette['primary'];
    electrocharged: Palette['primary'];
    shattered: Palette['primary'];
    swirl: Palette['primary'];
    burning: Palette['primary'];
    crystalize: Palette['primary'];
  }
  interface PaletteOptions {
    warning?: PaletteOptions['primary'];
    contentDark?: PaletteOptions['primary'];
    contentDarker?: PaletteOptions['primary'];
    contentLight?: PaletteOptions['primary'];
    roll1?: PaletteOptions['primary'];
    roll2?: PaletteOptions['primary'];
    roll3?: PaletteOptions['primary'];
    roll4?: PaletteOptions['primary'];
    roll5?: PaletteOptions['primary'];
    roll6?: PaletteOptions['primary'];
    geo?: PaletteOptions['primary'];
    dendro?: PaletteOptions['primary'];
    pyro?: PaletteOptions['primary'];
    hydro?: PaletteOptions['primary'];
    cryo?: PaletteOptions['primary'];
    electro?: PaletteOptions['primary'];
    anemo?: PaletteOptions['primary'];
    physical?: PaletteOptions['primary'];
    vaporize?: PaletteOptions['primary'];
    melt?: PaletteOptions['primary'];
    overloaded?: PaletteOptions['primary'];
    superconduct?: PaletteOptions['primary'];
    electrocharged?: PaletteOptions['primary'];
    shattered?: PaletteOptions['primary'];
    swirl?: PaletteOptions['primary'];
    burning?: PaletteOptions['primary'];
    crystalize?: PaletteOptions['primary'];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    warning: true;
    roll1: true;
    roll2: true;
    roll3: true;
    roll4: true;
    roll5: true;
    roll6: true;
    geo: true;
    dendro: true;
    pyro: true;
    hydro: true;
    cryo: true;
    electro: true;
    anemo: true;
    physical: true;
  }
  interface ChipPropsColorOverrides {
    warning: true;
    roll1: true;
    roll2: true;
    roll3: true;
    roll4: true;
    roll5: true;
    roll6: true;
    geo: true;
    dendro: true;
    pyro: true;
    hydro: true;
    cryo: true;
    electro: true;
    anemo: true;
    physical: true;
  }
}

const defaultTheme = createTheme({
  palette: {
    mode: `dark`,
  }
});
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: defaultTheme.palette.augmentColor({
      color: { main: '#1e78c8' },
      name: "primary"
    }),
    secondary: defaultTheme.palette.augmentColor({
      color: { main: '#6c757d' },
      name: "secondary"
    }),
    success: defaultTheme.palette.augmentColor({
      color: { main: '#46a046' },
      name: "success"
    }),
    warning: defaultTheme.palette.augmentColor({
      color: { main: `#ffc107` },
      name: "warning"
    }),
    error: defaultTheme.palette.augmentColor({
      color: { main: `#c83c3c` },
      name: "error"
    }),
    background: {
      default: '#0C1020',
      paper: '#0C1020',
    },
    info: defaultTheme.palette.augmentColor({
      color: { main: '#17a2b8' },
      name: "info"
    }),
    text: {
      primary: 'rgba(255,255,255,0.9)',

    },
    contentDark: defaultTheme.palette.augmentColor({
      color: { main: "#1b263b" },
      name: "contentDark"
    }),
    contentDarker: defaultTheme.palette.augmentColor({
      color: { main: "#172032" },
      name: "contentDarker"
    }),
    contentLight: defaultTheme.palette.augmentColor({
      color: { main: "#2a364d" },
      name: "contentLight"
    }),
    roll1: defaultTheme.palette.augmentColor({
      color: { main: "#a3a7a9" },
      name: "roll1"
    }),
    roll2: defaultTheme.palette.augmentColor({
      color: { main: "#6fa376", },
      name: "roll2"
    }),
    roll3: defaultTheme.palette.augmentColor({
      color: { main: "#8eea83", },
      name: "roll3"
    }),
    roll4: defaultTheme.palette.augmentColor({
      color: { main: "#31e09d", },
      name: "roll4"
    }),
    roll5: defaultTheme.palette.augmentColor({
      color: { main: "#27bbe4", },
      name: "roll5"
    }),
    roll6: defaultTheme.palette.augmentColor({
      color: { main: "#de79f0", },
      name: "roll6"
    }),
    geo: defaultTheme.palette.augmentColor({
      color: { main: "#f8ba4e", contrastText: "#fff" },
      name: "geo"
    }),
    dendro: defaultTheme.palette.augmentColor({
      color: { main: "#b1ea29", },
      name: "dendro"
    }),
    pyro: defaultTheme.palette.augmentColor({
      color: { main: "#bf2818", },
      name: "pyro"
    }),
    hydro: defaultTheme.palette.augmentColor({
      color: { main: "#2f63d4", },
      name: "hydro"
    }),
    cryo: defaultTheme.palette.augmentColor({
      color: { main: "#77a2e6", contrastText: "#fff" },
      name: "cryo"
    }),
    electro: defaultTheme.palette.augmentColor({
      color: { main: "#b25dcd", },
      name: "electro"
    }),
    anemo: defaultTheme.palette.augmentColor({
      color: { main: "#61dbbb", contrastText: "#fff" },
      name: "anemo"
    }),
    physical: defaultTheme.palette.augmentColor({
      color: { main: "#aaaaaa", },
      name: "physical"
    }),
    vaporize: defaultTheme.palette.augmentColor({
      color: { main: "#ffcb65", },
      name: "vaporize"
    }),
    melt: defaultTheme.palette.augmentColor({
      color: { main: "#ffcb65", },
      name: "melt"
    }),
    overloaded: defaultTheme.palette.augmentColor({
      color: { main: "#ff7e9a", },
      name: "overloaded"
    }),
    superconduct: defaultTheme.palette.augmentColor({
      color: { main: "#b7b1ff", },
      name: "superconduct"
    }),
    electrocharged: defaultTheme.palette.augmentColor({
      color: { main: "#e299fd", },
      name: "electrocharged"
    }),
    shattered: defaultTheme.palette.augmentColor({
      color: { main: "#98fffd", },
      name: "shattered"
    }),
    swirl: defaultTheme.palette.augmentColor({
      color: { main: "#66ffcb", },
      name: "swirl"
    }),
    burning: defaultTheme.palette.augmentColor({
      color: { main: "#bf2818", },
      name: "burning"
    }),
    crystalize: defaultTheme.palette.augmentColor({
      color: { main: "#f8ba4e", },
      name: "crystalize"
    }),
  },
  typography: {
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: defaultTheme.palette.mode === 'dark' ? darkScrollbar() : null,
      },
    },
    MuiAppBar: {
      defaultProps: {
        enableColorOnDark: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      }
    },
    MuiButton: {
      defaultProps: {
        variant: "contained"
      }
    },
    MuiButtonGroup: {
      defaultProps: {
        variant: "contained"
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
          marginTop: defaultTheme.spacing(1),
          marginBottom: defaultTheme.spacing(1),
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "& ul": {
            margin: 0,
            paddingLeft: defaultTheme.spacing(3)
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          [defaultTheme.breakpoints.down('sm')]: {
            padding: defaultTheme.spacing(1),
            "&:last-child": {
              paddingBottom: defaultTheme.spacing(1),
            }
          },
          [defaultTheme.breakpoints.up('sm')]: {
            "&:last-child": {
              paddingBottom: defaultTheme.spacing(2),
            }
          }
        }
      }
    }
  },
});
