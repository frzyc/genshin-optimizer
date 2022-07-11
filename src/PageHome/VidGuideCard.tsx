import { YouTube } from "@mui/icons-material";
import { Box, CardContent, CardHeader, Divider, Grid, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CardDark from "../Components/Card/CardDark";

const embeds = JSON.parse(process.env.REACT_APP_URLS_GUIDES ?? "[]") as string[]

export default function VidGuideCard() {
  const { t } = useTranslation(["page_home", "ui"])
  if (!embeds.length) return null
  return <CardDark>
    <CardHeader title={<Typography variant="h5" component={Link} color="inherit" href={process.env.REACT_APP_URL_YOUTUBE_TUTPL} target="_blank" rel="noopener">{t`vidGuideCard.title`}</Typography>} avatar={<YouTube fontSize="large" />} />
    <Divider />
    <CardContent>
      <Grid container columns={{ xs: 1, sm: 2 }} spacing={2} >
        {embeds.map(embed => <Grid item xs={1} key={embed}>
          <Box key={embed} sx={{
            position: "relative",
            pb: "56.25%",
            /* 16:9 */
            pt: "25px",
            height: 0,
            borderRadius: 2,
            overflow: "hidden",
            "> iframe": {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }
          }}>
            <iframe width="560" height="349" title="Genshin Optimizer Guide" src={`https://www.youtube-nocookie.com/embed/${embed}`} frameBorder={0} allowFullScreen />
          </Box>
        </Grid>)}
      </Grid>
    </CardContent>
  </CardDark>
}
