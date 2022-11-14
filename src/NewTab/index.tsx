import { DynamicFeed, Refresh } from "@mui/icons-material";
import { Box, Button, CardActions, CardContent, CardHeader, CssBaseline, Divider, StyledEngineProvider, ThemeProvider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import CardLight from "../Components/Card/CardLight";
import { theme } from "../Theme";
import derp from "./derpeye.png";
import eye from "./eye.png"
import emoji from "./derp.jpeg"
import '../i18n';
import { useEffect, useState } from "react";
import ModalWrapper from "../Components/ModalWrapper";
import { evtExcerpt, evtFoundTitle } from "../event";


function angle(cx, cy, ex, ey) {
  const dy = ey - cy;
  const dx = ex - cx;
  return Math.atan2(dy, dx) * 180 / Math.PI
}
let currentAng = -180
export default function NewTab() {
  const [rotCount, setRotCount] = useState(0)
  useEffect(() => {
    const anchor = document.getElementById("anchor")!
    const rect = anchor.getBoundingClientRect()
    const eyes = document.querySelectorAll(".eye")
    function mouseHandler(e) {
      // console.log(e)
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const anchorX = rect.left + rect.width / 2
      const anchorY = rect.top + rect.height / 2
      const angleDeg = angle(mouseX, mouseY, anchorX, anchorY)

      anchor.style.filter= `hue-rotate(${angleDeg}deg)`
      eyes.forEach(eye => {
        (eye as any).style.transform = `rotate(${90 + angleDeg}deg)`
      })

      //determine rotations
      const roundedDeg = Math.round(angleDeg / 10) * 10
      const lookingDeg = currentAng + 10
      if (roundedDeg === lookingDeg) {
        currentAng = lookingDeg
        if (currentAng === 180) {
          currentAng = -180
          setRotCount(rotCount + 1)
        }
      }
    }
    document.addEventListener("mousemove", mouseHandler)
    return () => document.removeEventListener("mousemove", mouseHandler)
  }, [rotCount, setRotCount])
  const { t } = useTranslation("page_newTab")
  return <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ModalWrapper containerProps={{ maxWidth: "md" }} open={rotCount >= 5} onClose={() => setRotCount(0)}>
      <CardLight>
        <CardHeader title={evtFoundTitle} />
        <Divider />
        <CardContent>
          {evtExcerpt}
          <Typography><strong><code>:paimonHmm:</code></strong></Typography>
          <img src={emoji} alt="" style={{maxHeight:240, maxWidth:240}} />
          <Typography>Here is your code:</Typography>
          <Typography variant='h6'><code>N0MULT1T4B</code></Typography>
        </CardContent>
      </CardLight>
    </ModalWrapper>
      <Box display="flex" minWidth="100vw" minHeight="100vh" justifyContent="center" alignItems="center" >
        <CardLight>
          <Box display="flex" flexDirection="column">
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6">{t`title`}</Typography>
              <DynamicFeed />
            </CardContent>
            <Divider />
            <Box display="flex">
              <CardContent sx={{ flexGrow: 1, maxWidth: 600 }}>
                <Typography>{t`p1`}</Typography>
                <ul>
                  <li>{t`symptom.1`}</li>
                  <li>{t`symptom.2`}</li>
                  <li>{t`symptom.3`}</li>
                  <li>{t`symptom.4`}</li>
                </ul>
                <Typography>{t`p2`}</Typography>
                <ul>
                  <li>{t`choice.1`}</li>
                  <li>{t`choice.2`}</li>
                </ul>
              </CardContent>
              <Box height={400} sx={{ position: "relative" }}>
                <Box id="anchor" component="img" src={derp} width="auto" height="100%" />
                <Box className="eye" component="img" src={eye} sx={{ position: "absolute", width: 37.5, height: 37.5, top: 230, left: 101 }} />
                <Box className="eye" component="img" src={eye} sx={{ position: "absolute", width: 37.5, height: 37.5, top: 200, left: 207 }} />
              </Box>
            </Box>
            <Divider />
            <CardActions>
              <Button startIcon={<Refresh />} onClick={() => document.location.reload()}>{t`refresh`}</Button>
            </CardActions>
          </Box>
        </CardLight>
      </Box>
    </ThemeProvider>
  </StyledEngineProvider>
}
