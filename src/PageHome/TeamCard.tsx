import { Box, CardContent, CardHeader, Divider, Grid, Link, Typography } from "@mui/material";
import CardDark from "../Components/Card/CardDark";
import CardLight from "../Components/Card/CardLight";
import frzyc from "./teamIcons/frzyc.png"
import lantua from "./teamIcons/lantua.png"
import van from "./teamIcons/van.png"
import stain from "./teamIcons/stain.png"
import sin from "./teamIcons/sin.png"
import { Groups } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
const team = [{
  name: "frzyc",
  img: frzyc,
  title: t => t`teamCard.jobTitle.leadDev`,
  subtitle: "Insomniac in Chief",
  url: process.env.REACT_APP_URL_GITHUB_FRZYC
}, {
  name: "Lantua",
  img: lantua,
  title: t => t`teamCard.jobTitle.dev`,
  subtitle: "Copium Calculator",
  url: process.env.REACT_APP_URL_GITHUB_LANTUA
}, {
  name: "Van",
  img: van,
  title: t => t`teamCard.jobTitle.dev`,
  subtitle: "Waverider Stowaway",
  url: process.env.REACT_APP_URL_GITHUB_VAN
}, {
  name: "✦ Sin ✦",
  img: sin,
  title: t => t`teamCard.jobTitle.mod`,
  subtitle: "Ohh, shiny.",
  url: ""
}, {
  name: "Stain",
  img: stain,
  title: t => t`teamCard.jobTitle.mod`,
  subtitle: "Australia Man",
  url: ""
},] as const

export default function TeamCard() {
  const { t } = useTranslation(["page_home", "ui"])
  return <CardDark>
    <CardHeader title={<Typography variant="h5">{t`teamCard.title`}</Typography>} avatar={<Groups fontSize="large" />} />
    <Divider />
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Grid container columns={{ xs: 6, md: 5 }} spacing={1}>
        {team.map(({ name, img, title, subtitle, url }, i) => <Grid item key={name} xs={i < 2 ? 3 : 2} md={1}>
          <CardLight sx={{ height: "100%" }}>
            <CardContent>
              <Box component="img" src={img} sx={{ width: "100%", height: "auto", borderRadius: "50%" }} />
              <Box display="flex" flexDirection="column">
                {url ? <Typography variant="h6" sx={{ textAlign: "center" }} color="inherit" component={Link} href={url} target="_blank" rel="noopener"><strong>{name}</strong></Typography> :
                  <Typography variant="h6" sx={{ textAlign: "center" }}><strong>{name}</strong></Typography>}
                <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
                  {title(t)}
                </Typography>
                <Typography variant="subtitle2" sx={{ textAlign: "center", transform: name === "Stain" ? "rotate(180deg)" : undefined }} color="secondary.light">
                  {subtitle}
                </Typography>
              </Box>
            </CardContent>
          </CardLight>
        </Grid>)}
      </Grid>
    </CardContent>
  </CardDark>
}
