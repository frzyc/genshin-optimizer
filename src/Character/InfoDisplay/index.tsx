import { faChevronDown, faEdit, faLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Grid, Typography } from '@mui/material'
import ColorText from '../../Components/ColoredText'
import ImgFullwidth from '../../Components/Image/ImgFullwidth'
import SqBadge from '../../Components/SqBadge'
import ArtifactView from './ArtifactView.png'
import enemyEditor from './enemyEditor.png'
import inventory from './Inventory.png'
import overview from './Overview.png'
import TalentView from './TalentView.png'

export default function CharacterInfoDisplay() {
  /**
   * Enemies & calculations
   *  hitMode
   *  Enemy
   *  Calculations
   * 
   * character overview
   *  weapon condtitional
   *  level template 
   *  overwrite stats
   * 
   * artifacts
   *  artifact conditional
   * 
   * talents & constellations
   *  talent conditional
   *  autoInfusion
   */
  return <Grid container spacing={2}>
    <Grid item xs={12} lg={7} >
      <ImgFullwidth src={inventory} />
    </Grid>
    <Grid item xs={12} lg={5} >
      <Typography variant="h4">Character Inventory</Typography>
      <Typography gutterBottom>All the characers that you've added to Genshin Optimizer is in this screen. This inventory screen allow you to Add/edit/delete characters, as well as see an overview of each character from each card.</Typography>
      <Typography gutterBottom>To Edit specific details of a character, click on its corresponding card, or click on the <SqBadge color="info"><FontAwesomeIcon icon={faEdit} /> Edit Stats</SqBadge> Button</Typography>
      <Typography variant="h5">Filtering and sorting</Typography>
      <Typography gutterBottom>You can also filter the characters by Elemental or Weapons, and sort the characters by Level/Rarity/Name.</Typography>
    </Grid>
    <Grid item xs={12} lg={6} xl={7} >
      <Typography variant="h4">Character Editor</Typography>
      <Typography gutterBottom>This is the main character editor. There is a lot to unpack here, so each sections are labeled. </Typography>
      <Typography variant="h5">1. Character & level template selector</Typography>
      <Typography gutterBottom>You can change the character to edit here. The Level template changes the default base stats that are populated in the editor for the character. Currently, GO only offers milestone templates, so the stats will need to be manually adjusted for non-milestone levels.</Typography>
      <Typography variant="h5">2. Navigation tabs</Typography>
      <Typography gutterBottom>The tabs here navigate to different views of the character editor. Currently the <i>Character</i> view is enabled. The <i>Artifacts</i> and <i>Talents</i> view will be elaborated in their dedicated section below.</Typography>
      <Typography variant="h5">3. Party Infusion, Hit Mode & Reaction Mode</Typography>
      <Typography gutterBottom>If a character's autos can be infused with an element from their talents(e.g. <i>Chongyun's Spirit Blade: Chonghua's Layered Frost</i>), this will need to be manually enabled here.</Typography>
      <Typography gutterBottom>For the DMG numbers shown in GO, the <b>Hit Mode</b> determines how they are calculated: </Typography>
      <Typography component="div">
        <ul>
          <li><b>Avg. DMG:</b> The damage is averaged over CRIT Rate & CRIT DMG.</li>
          <li><b>Non Crit DMG:</b> The damage of a non-crit hit. CRIT Rate & CRIT DMG are not part of the calculations.</li>
          <li><b>Crit Hit DMG:</b> The damage of a  crit hit. CRIT Rate is ignored. Only CRIT DMG is part of the calculations.</li>
        </ul>
      </Typography>
      <Typography gutterBottom>A character's damage changes drastically when they do an amplifing reaction, like <ColorText color="vaporize">Vaporize</ColorText> or <ColorText color="melt">Melt</ColorText>. You can enable the <b>Reaction Mode</b> from this toggle.</Typography>
    </Grid>
    <Grid item xs={12} lg={6} xl={5} >
      <ImgFullwidth src={overview} />
    </Grid>
    <Grid item xs={12} lg={6} xl={5} >
      <ImgFullwidth src={enemyEditor} />
    </Grid>
    <Grid item xs={12} lg={6} xl={7} >
      <Typography variant="h5">4. Enemy Editor & Calculation details.</Typography>
      <Typography gutterBottom>This UI is usually Hidden. You need to expand it by clicking on the <FontAwesomeIcon icon={faChevronDown} />.</Typography>
      <Typography variant="h6">4.1 Enemy Editor</Typography>
      <Typography gutterBottom>For the calculated numbers in GO to truely reflect in-game numbers, the exact enemy conditions must be replicated. This means that the relevant enemy resistance/level must be set here. </Typography>
      <Typography variant="h6">4.2 Calculation details</Typography>
      <Typography gutterBottom>For every number calculated by a formula, GO will display exactly how exactly that number is calculated. Just click on the number to show the full calculations.</Typography>
    </Grid>
    <Grid item xs={12}>
      <Typography variant="h5">5. Character Overview</Typography>
      <Typography gutterBottom>Contains general character information. Setting the <b>level</b> in this UI changes the calculations for damage, but it does NOT change the stats in the editor. Only the Template Level can change the base stats in the editor.</Typography>
      <Typography gutterBottom>You can also set the constellations of the character here by clicking on the icons.</Typography>

      <Typography variant="h5">6. Weapon Editor</Typography>
      <Typography gutterBottom>Shows the weapon description & stats. You can change the weapon by clicking on the <SqBadge color="info"><FontAwesomeIcon icon={faEdit} /> EDIT</SqBadge> Button.</Typography>
      <Typography gutterBottom>Some weapons have passives that provide additional stats. You can enable them to provide more real-time stats to the character, as well as provide more base stats to the Build Generator. In the image, the <i>Whiteblind</i> passive is fully stacked.</Typography>

      <Typography variant="h5">7. Stats Editor</Typography>
      <Typography gutterBottom>These sections shows the calculated stats, from weapons/artifacts/talents. To change the base value of a stat or to add a external buff/debuff to a stat, click on the <SqBadge color="info"><FontAwesomeIcon icon={faEdit} /> EDIT Stats</SqBadge> Button, and overwrite the stat in question. A overwritten stat will show up in yellow.</Typography>

      <Typography variant="h5">8. Share character</Typography>
      <Typography gutterBottom>Do you want to share your character build with friends? Click on the <SqBadge color="info"><FontAwesomeIcon icon={faLink} /> Share Character</SqBadge> button, which will generate a URL that you can share.</Typography>
    </Grid>
    <Grid item xs={12} lg={4} >
      <ImgFullwidth src={ArtifactView} />
    </Grid>
    <Grid item xs={12} lg={4} >
      <Typography variant="h4">Artifact View</Typography>
      <Typography gutterBottom>The top half of the artifact view shows a overview of the character stats, as well as all the formula results from a character.</Typography>
      <Typography gutterBottom>The bottom half of the artifact view shows the equipped artifacts on your character. If the artifact set has a condtional effect, you can enable it here.</Typography>

      <Typography variant="h4">Talent View</Typography>
      <Typography gutterBottom>This page shows all the detailed character talent/constellations details. This is also the place to set your talent levels of your talents.</Typography>
      <Typography gutterBottom>Any conditional stats from talents can be enabled here. </Typography>
    </Grid>
    <Grid item xs={12} lg={4} >
      <ImgFullwidth src={TalentView} />
    </Grid>
  </Grid >
}