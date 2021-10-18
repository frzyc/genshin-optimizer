import { Grid, Typography } from '@mui/material'
import ImgFullwidth from '../../Components/Image/ImgFullwidth'
import SqBadge from '../../Components/SqBadge'
import overview from './buildScreen.png'
import preview from './preview.png'

export default function BuildInfoDisplay() {
  /**
   * CharacterCard
   * HitMode options
   * Final Stat Filter
   * Artifact sets
   * use locked/equipped
   * main stat
   * Optimization Target
   * Genrate builds
   * builds
   * Compare
   * 
   * IMAGES:
   * Main build page (numbered)
   * Results
   * Artifact Compare
   */
  return <Grid container rowSpacing={2} >
    <Grid item xs={12} lg={6}>
      <Typography variant="h6">Build Screen</Typography>
      <Typography>A <b>Build</b> is a set of 5 artifacts of each slot for a specific character. This page allows the generation of builds from artifacts in the GO inventory that can maximize a specific <b>optimization target</b>.</Typography>
      <Typography variant="body2">
        <ol>
          <li><strong>Character Card</strong> Click on this card to change parameters about the character, add Talent/stats to replicate in-game state.</li>
          <li><strong>HitMode Options</strong> Change infusion, hitmode, or reaction mode for the <b>optimization target</b>, if it is a DMG source.</li>
          <li><strong>Final Stat Filter</strong> Filter the build generated to conform to some stat requirements, e.g. Optimize by Elemental Burst DMG, with builds above 140% Energy Recharge.</li>
          <li><strong>Artifact Set Options</strong> Use the <b>Default Artifact Set Effects</b> option to provide which conditional artifact set effects to use for the build generation. If specific artifact sets are necessary, use the <b>Artifact Set Filters</b> to restrict the build.</li>
          <li><strong>Use Locked/Equipped Artifacts</strong>By default, the build genertor will not include locked or equipped artifacts from the GO inventory. These options can override this behaviour.</li>
          <li><strong>Level Assumption</strong> Assuming the artifact's main stat is leveled up to a specific level. The substats are not affected at all, this will only change the main stat value.</li>
          <li><strong>Artifact Main Stat</strong> Filter builds to have specific main stats on Sands, Goblet, Circlet.</li>
          <li><strong>Optimization Target</strong> The metric to rank build results with. Any formula in the system can be an optimization syste, including DMG, shield, healing, etc. Some basic stats like HP and reactions can also be targets.</li>
          <li><strong>Generate Builds</strong> The <b>Generate</b> button will calculate the optimization target for build combinations that passes the filters, and rank them in the results. The number of build results can be lower to decrease the time it takes to generate the builds when the total build number is high.</li>
          <li><strong>Build notice</strong> This will pre-calculate the amount of total amount of builds that can be  generated. The larger the number, the longer the build generation process will take.</li>
        </ol>
      </Typography>
    </Grid>
    <Grid item xs={12} lg={6}>
      <ImgFullwidth src={overview} />
    </Grid>
    <Grid item xs={12} lg={6}>
      <ImgFullwidth src={preview} />
    </Grid>
    <Grid item xs={12} lg={6}>
      <Typography variant="h6">Build preview</Typography>
      <Typography gutterBottom>Once builds are generated, clicking on any build will show the Character Screen with the stats from the new build.</Typography>
      <Typography gutterBottom>Clicking on the <SqBadge color="success">Compare against equipped artifacts</SqBadge> will show the difference of stats between the generated build and the currently equipped build on the character.</Typography>
      <Typography>If a level assumption is set, both the equipped build and the new build will boost their mainstat value to that level. The boosted artifacts' mainstats are orange in this case.</Typography>
    </Grid>
  </Grid>
}