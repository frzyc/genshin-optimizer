import { AppBar, Box, CardContent, CardHeader, Divider, Skeleton, Tooltip, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import packageInfo from '../package.json';
import CardLight from "./Components/Card/CardLight";
import ModalWrapper from "./Components/ModalWrapper";
import { evtExcerpt, evtFoundTitle } from "./event";
import useBoolState from "./ReactHooks/useBoolState";
import emoji from "./Layla4SleepSpin.png"

export default function Footer() {
  return <Suspense fallback={<Skeleton variant="rectangular" height={64} />}>
    <FooterContent />
  </Suspense>
}
function FooterContent() {
  const { t } = useTranslation("ui")
  return <AppBar position="static" sx={{ bgcolor: "#343a40" }} elevation={0}>
    <Box display="flex" justifyContent="space-between" sx={{ px: 2, py: 1 }} gap={2}>
      <Typography variant="caption" sx={{ color: grey[200] }}>
        <Trans t={t} i18nKey="ui:rightsDisclaimer">Genshin Optimizer is not affiliated with or endorsed by HoYoverse.</Trans>
      </Typography>
      <Typography variant="caption" sx={{ color: grey[200], textAlign: "right" }} >
        <Trans t={t} i18nKey="ui:appVersion" values={{ version: packageInfo.version }}>
          Genshin Optimizer Version:
          <VWrapper>
            {{ version: packageInfo.version }}
          </VWrapper>
        </Trans>
      </Typography>
    </Box>
  </AppBar >
}
function VWrapper({ children }) {
  const [show, onShow, onHide] = useBoolState(false)

  return <>
    <ModalWrapper containerProps={{ maxWidth: "md" }} open={show} onClose={onHide}>
      <CardLight>
        <CardHeader title={evtFoundTitle} />
        <Divider />
        <CardContent>
          {evtExcerpt}
          <Typography><strong><code>:Layla4Sleep:</code></strong></Typography>
          <img src={emoji} alt="" />
          <Typography variant='h6'><code>0xDEADBEEF</code></Typography>
        </CardContent>
      </CardLight>
    </ModalWrapper>
    <Tooltip arrow title={<Suspense fallback={<Box width="200" height="200" />}><img src={emoji} onClick={onShow} style={{ cursor: "pointer" }} alt="" /></Suspense>}>
      <a
        href={`${process.env.REACT_APP_URL_GITHUB_GO}/releases`}
        style={{ color: "white", fontFamily: "monospace" }}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    </Tooltip>
  </>
}
