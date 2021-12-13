import { Grid, Typography, Box } from '@mui/material'
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
  return <Grid container rowSpacing={2} spacing={2}>
    <Grid item xs={12} md={6} lg={5}>
      <Typography variant="h6">Build Screen</Typography>
      <Typography>A <b>Build</b> is a set of 5 artifacts of each slot for a specific character. This page allows the generation of builds from artifacts in the GO inventory that can maximize a specific <b>optimization target</b>.</Typography>
      <Typography variant="body1" component="div">
        <Box component="ol" display="flex" flexDirection="column" gap={1}>
          {/* 1 */}
          <li><strong>Character Card</strong> Click on this card to go to the character page. Character Talent/stats/details in the character page can be used to replicate in-game state.</li>
          {/* 2 */}
          <li><strong>Enemy Editor</strong> Change the enemy level/resistance/immunity.</li>
          {/* 3 */}
          <li><strong>Minimum Final Stat Filter</strong> Filter the build generated to conform to some stat requirements, e.g. Generate builds with at least 140% Energy Recharge.</li>
          {/* 4 */}
          <li><strong>HitMode Options</strong> Change infusion, hitmode, or reaction mode for the <b>optimization target</b>, if it is a DMG source.</li>
          {/* 5 */}
          <li><strong>Default Artifact Set Effects Conditionals</strong> Use this UI to provide which conditional artifact set effects to use for the build generation. e.g. Make the builder account for 4-set Noblesse Oblige buff.</li>
          {/* 6 */}
          <li><strong>Artifact Set Options</strong> Limit the build to a specific artifact set.</li>
          {/* 7 */}
          <li><strong>Use Locked/Equipped Artifacts</strong>By default, the build genertor will not include locked or equipped artifacts from the GO inventory. These options can override this behaviour.</li>
          {/* 8 */}
          <li><strong>Artifact Level Filter</strong>Change the level range of the artifacts to use in the build generation.</li>
          {/* 9 */}
          <li><strong>Level Assumption</strong> Assuming the artifact's main stat is leveled up to a specific level. The substats are not affected at all, this will only change the main stat value.</li>
          {/* 10 */}
          <li><strong>Artifact Main Stat</strong> Filter builds to have specific main stats on Sands, Goblet, Circlet.</li>
          {/* 11 */}
          <li><strong>Optimization Target</strong> The metric to rank build results with. Any formula in the system can be an optimization target, including DMG, shield, healing, etc. Some basic stats like HP and reactions can also be targets.</li>
          {/* 12 */}
          <li><strong>Generate Builds</strong> The <b>Generate</b> button will calculate the optimization target for build combinations that passes the filters/settings, and rank them in the results.</li>
          {/* 13 */}
          <li><strong>Build number</strong> Limit the number of builds to return as results. The lower the number, the faster the build.</li>
          {/* 14 */}
          <li><strong>Build notice</strong> This will pre-calculate the amount of total amount of builds that can be  generated. The larger the number, the longer the build generation process will take.</li>
        </Box>
      </Typography>
    </Grid>
    <Grid item xs={12} md={6} lg={7}>
      <ImgFullwidth src={overview} />
    </Grid>
    <Grid item xs={12} lg={6}>
      <ImgFullwidth src={preview} />
    </Grid>
    <Grid item xs={12} lg={6}>
      <Typography variant="h6">Build Preview</Typography>
      <Typography gutterBottom>Once builds are generated, clicking on any build will show the Character Screen with the stats from the new build.</Typography>
      <Typography gutterBottom>Clicking on the <SqBadge color="success">Compare against equipped artifacts</SqBadge> will show the difference of stats between the generated build and the currently equipped build on the character.</Typography>
      <Typography>If a level assumption is set, both the equipped build and the new build will boost their mainstat value to that level. The boosted artifacts' mainstats are orange in this case.</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>How does the Builder work?</Typography>
      <Typography gutterBottom>The Builder is effectively a big loop, that iterates over all permutations and combination of artifact builds, in a brute-force fashion. Brute force allows the builder to guarantee the most "optimal" optimization target results. Since brute force is a very inefficient process, a lot of optimizations have been done around it to speed up the build process.</Typography>
      <Typography gutterBottom>
        The main way the builder reduces build time is by pruning "inferior" artifacts from the calculation space before the permutations for all the artifact combinations are calculated. (These account for the "skipped" builds number displayed during build generation). This also means that "maximum" stats filters does not work with the pruning algorithm, since it would interfere with the definition of "inferior".
      </Typography>
      <Typography>
        Pruning, along with multi-threading, can do a lot to reduce build time. However, it is up to the user to configure the remaining build settings to get further reductions in build time, e.g. reducing the number of builds to display, restricting the number of main stats... etc.
      </Typography>
    </Grid>
  </Grid>
}