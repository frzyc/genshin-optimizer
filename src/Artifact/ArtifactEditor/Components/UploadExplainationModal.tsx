import { Alert, Box, CardContent, Divider, Grid, Typography } from '@mui/material';
import CardDark from '../../../Components/Card/CardDark';
import CloseButton from '../../../Components/CloseButton';
import ModalWrapper from '../../../Components/ModalWrapper';
import scan_art_main from "./imgs/scan_art_main.png";
import Snippet from "./imgs/snippet.png";
export default function UploadExplainationModal({ modalShow, hide }: { modalShow: boolean, hide: () => void }) {
  return <ModalWrapper open={modalShow} onClose={hide} >
    <CardDark>
      <CardContent sx={{ py: 1 }}>
        <Grid container>
          <Grid item flexGrow={1}>
            <Typography variant="subtitle1">How do Upload Screenshots for parsing</Typography>
          </Grid>
          <Grid item>
            <CloseButton onClick={hide} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent>
        <Alert variant="outlined" severity="warning">
          NOTE: Artifact Scanning currently only work for <strong>ENGLISH</strong> artifacts.
        </Alert>
        <Grid container spacing={1} mt={1}>
          <Grid item xs={8} md={4}>
            <Box component="img" alt="snippet of the screen to take" src={Snippet} width="100%" height="auto" />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography gutterBottom>Using screenshots can dramatically decrease the amount of time you manually input in stats on the Genshin Optimizer.</Typography>
            <Typography variant="h5">Where to snip the screenshot.</Typography>
            <Typography gutterBottom>In game, Open your bag, and navigate to the artifacts tab. Select the artifact you want to scan with Genshin Optimizer. <b>Only artifact from this screen can be scanned.</b></Typography>
            <Typography variant="h6">Single artifact</Typography>
            <Typography gutterBottom>To take a screenshot, in Windows, the shortcut is <strong>Shift + WindowsKey + S</strong>. Once you selected the region, the image is automatically included in your clipboard.</Typography>
            <Typography variant="h6">Multiple artifacts</Typography>
            <Typography gutterBottom>To take advantage of batch uploads, you can use a tool like <a href="https://picpick.app/" target="_blank" rel="noreferrer">PicPick</a> to create a macro to easily to screenshot a region to screenshot multiple artifacts at once.</Typography>
            <Typography variant="h5">What to include in the screenshot.</Typography>
            <Typography>As shown in the Image, starting from the top with the artifact name, all the way to the set name(the text in green). </Typography>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h5">Adding Screenshot to Genshin Optimizer</Typography>
            <Typography>At this point, you should have the artifact snippet either saved to your harddrive, or in your clipboard.</Typography>
            <Typography gutterBottom>You can click on the box next to "Browse" to browse the files in your harddrive for multiple screenshots.</Typography>
            <Typography>For single screenshots from the snippets, just press <strong>Ctrl + V</strong> to paste from your clipboard.</Typography>
            <Typography gutterBottom>You should be able to see a Preview of your artifact snippet, and after waiting a few seconds, the artifact set and the substats will be filled in in the <b>Artifact Editor</b>.</Typography>
            <Typography variant="h5">Finishing the Artifact</Typography>
            <Typography>Unfortunately, computer vision is not 100%. There will always be cases where something is not scanned properly. You should always double check the scanned artifact values! Once the artifact has been filled, Click on <strong>Add Artifact</strong> to finish editing the artifact.</Typography>
          </Grid>
          <Grid item xs={8} md={5}>
            <Box component="img" alt="main screen after importing stats" src={scan_art_main} width="100%" height="auto" />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <CloseButton large onClick={hide} />
      </CardContent>
    </CardDark>
  </ModalWrapper>
}