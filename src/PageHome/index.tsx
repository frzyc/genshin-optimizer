import { Box, CardContent, Grid, Link, Typography, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/system"
import ReactGA from 'react-ga4'
import { Trans, useTranslation } from "react-i18next"
import CardDark from "../Components/Card/CardDark"
import InventoryCard from "./InventoryCard"
import VidGuideCard from "./VidGuideCard"
import QuickLinksCard from "./QuickLinksCard"
import ResinCard from "./ResinCard"
import TeamCard from "./TeamCard"

export default function PageHome() {
  // TODO: translations
  // const { t } = useTranslation("page_home")
  const theme = useTheme();
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  ReactGA.send({ hitType: "pageview", page: '/home' })
  if (lg) return <Grid container spacing={2} direction={"row-reverse"} sx={{ my: 2 }}>
    <Grid item xs={12} lg={5} xl={4} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <QuickLinksCard />
      <ResinCard />
    </Grid>
    <Grid item xs={12} lg={7} xl={8} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <IntroCard />
      <InventoryCard />
      <VidGuideCard />
      <TeamCard />
    </Grid>

  </Grid>
  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <IntroCard />
    <QuickLinksCard />
    <InventoryCard />
    <ResinCard />
    <VidGuideCard />
    <TeamCard />
  </Box >
}

function IntroCard() {
  const { t } = useTranslation("page_home")
  return <CardDark>
    <CardContent>
      <Typography variant="subtitle1">
        <Trans t={t} i18nKey="intro" >
          The <strong>ultimate</strong> <Link href="https://genshin.mihoyo.com/" target="_blank" rel="noreferrer"><i>Genshin Impact</i></Link> calculator, GO will keep track of your artifact/weapon/character inventory, and help you create the best build based on how you play, with what you have.
        </Trans>
      </Typography>
    </CardContent>
  </CardDark>
}
