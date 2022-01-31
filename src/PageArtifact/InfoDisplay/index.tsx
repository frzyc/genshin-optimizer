import { faBan, faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Grid, Link, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import ImgFullwidth from '../../Components/Image/ImgFullwidth'
import SqBadge from '../../Components/SqBadge'
import { Stars } from '../../Components/StarDisplay'
import artifactcard from './artifactcard.png'
import artifacteditor from './artifacteditor.png'
import artifactfilter from './artifactfilter.png'
function Colors() {
  return <span>{[...Array(6).keys()].map(s => <SqBadge color={`roll${s + 1}`} key={s} sx={{ ml: 1 }}><b>{s + 1}</b></SqBadge>)}</span>
}
export default function ArtifactInfoDisplay() {
  const { t } = useTranslation("artifact")
  return <Grid container spacing={1} >
    <Grid item xs={12} lg={5} xl={4}>
      <ImgFullwidth src={artifactcard} />
    </Grid>
    <Grid item xs={12} lg={7} xl={8}>
      <Trans t={t} i18nKey="info.section1">
        <Typography variant="h5">Substat rolls</Typography>
        <Typography gutterBottom>The <b>number of rolls</b> a substat has is shown to the left of the substat. As the number gets higher, the substat is more colorful:<Colors />.</Typography>

        <Typography variant="h5">Substat Efficiency</Typography>
        <Typography gutterBottom>The Efficiency of an subtat is a percentage of the current value over the highest potential 5<Stars stars={1} /> value. From the Image, the maximum roll value of CRIT DMG is 7.8%. In efficiency: <b>5.8/7.8 = 69.2%.</b></Typography>

        <Typography variant="h5">Current substats Efficiency vs. Maximum Substats Efficiency</Typography>
        <Typography gutterBottom>When a 5<Stars stars={1} /> have 9(4+5) total rolls, with each of the rolls having the highest value, that is defined as a 100% efficient artifact. However, most of the artifacts are not this lucky. The <b>Current substats Efficiency</b> of an artifact is a percentage over that 100% artifact. The <b>Maximum Substats Efficiency</b> is the maximum possible efficiency an artifact can achieve, if the remaining artifact rolls from upgrades are the hightest possible value.</Typography>

        <Typography variant="h5">Locking an artifact</Typography>
        <Typography>By locking an artifact <FontAwesomeIcon icon={faBan} />, This artifact will not be picked up by the build generator for optimization. An equipped artifact is locked by default.</Typography>
      </Trans>
    </Grid>
    <Grid item xs={12} lg={6} xl={7} >
      <Trans t={t} i18nKey="info.section2">
        <Typography variant="h5">Artifact Editor</Typography>
        <Typography gutterBottom>A fully featured artifact editor, that can accept any 3<Stars stars={1} /> to 5<Stars stars={1} /> Artifact. When a substat is inputted, it can calculate the exact roll values, and from it, the efficiency. It will also make sure that you have the correct number of rolls in the artifact according to the level, along with other metrics of validation.</Typography>

        <Typography variant="h5">Scan screenshots</Typography>
        <Typography gutterBottom>Manual input is not your cup of tea? You can scan in your artifacts with screenshots! On the Artifact Editor, click the <SqBadge color="info">Show Me How!</SqBadge> button to learn more.</Typography>

        <Typography variant="h6">Automatic Artifact Scanner</Typography>
        <Typography gutterBottom>If you are playing Genshin on PC, you can download a tool that automatically scans all your artifacts for you, and you can then import that data in <FontAwesomeIcon icon={faCog} /> Database. <Link component={RouterLink} to="/scanner">Click here</Link> for a list of scanners that are compatible with GO.</Typography>

        <Typography variant="h5">Duplicate/Upgrade artifact detection</Typography>
        <Typography>Did you know GO can detect if you are adding a <b>duplicate</b> artifact that exists in the system? It can also detect if the current artifact in editor is an <b>upgrade</b> of an existing artifact as well. Once a duplicate/upgrade is detected, a preview will allow you to compare the two artifacts in question(See Image).</Typography>
      </Trans>
    </Grid>
    <Grid item xs={12} lg={6} xl={5}>
      <ImgFullwidth src={artifacteditor} />
    </Grid>
    <Grid item xs={12} lg={7} xl={6}>
      <ImgFullwidth src={artifactfilter} />
    </Grid>
    <Grid item xs={12} lg={5} xl={6}>
      <Trans t={t} i18nKey="info.section3">
        <Typography variant="h5">Artifact Inventory</Typography>
        <Typography gutterBottom>All your artifacts that you've added to GO is displayed here. The filters here allow you to further refine your view of your artifacts. </Typography>
        <Typography variant="h5">Example: Finding Fodder Artifacts</Typography>
        <Typography>By utilizing the artifact filter, and the artifact efficiency calculations, you can quickly find artifacts to feed as food.</Typography>
        <Typography>In this example, the filters are set thusly: </Typography>
        <Typography component="div" >
          <ul>
            <li>Limit level to 0-8.</li>
            <li>Unlocked artifacts in Inventory.</li>
            <li>Removing the contribution of flat HP, flat DEF and Energy Recharge to efficiency calculations.</li>
            <li>Sorted by Ascending Max Efficiency.</li>
          </ul>
        </Typography>
        <Typography>This will filter the artifact Inventory by the lowest efficiency artifacts, for desired substats.</Typography>
      </Trans>
    </Grid>
  </Grid>
}