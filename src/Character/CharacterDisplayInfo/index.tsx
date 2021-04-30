import { faEdit, faLink, faWindowMaximize } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Col, Image, Row } from 'react-bootstrap'
import overview from './Overview.png'
import inventory from './Inventory.png'
import enemyEditor from './enemyEditor.png'
import ArtifactView from './ArtifactView.png'
import TalentView from './TalentView.png'

export default function CharacterDisplayInfo() {
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
   * 
   *  
   */
  return <>
    <Row className="mb-2">
      <Col xs={12} lg={7} >
        <Image src={inventory} className="w-100 h-auto" />
      </Col>
      <Col xs={12} lg={5} >
        <h4>Character Inventory</h4>
        <p>All the characers that you've added to Genshin Optimizer is in this screen. This inventory screen allow you to Add/edit/delete characters, as well as see an overview of each character from each card.</p>
        <p>To Edit specific details of a character, click on its corresponding card, or click on the <Badge variant="primary"><FontAwesomeIcon icon={faEdit} /></Badge> Button</p>
        <h5>Filtering and sorting</h5>
        <p>You can also filter the characters by Elemental or Weapons, and sort the characters by Level/Rarity/Name.</p>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col xs={12} lg={6} xl={7} >
        <h4>Character Editor</h4>
        <p>This is the main character editor. There is a lot to unpack here, so each sections are labeled. </p>
        <h5>1. Character & level template selector</h5>
        <p>You can change the character to edit here. The Level template changes the default base stats that are populated in the editor for the character. Currently, GO only offers milestone templates, so the stats will need to be manually adjusted for non-milestone levels.</p>
        <h5>2. Navigation tabs</h5>
        <p>The tabs here navigate to different views of the character editor. Currently the <i>Character</i> view is enabled. The <i>Artifacts</i> and <i>Talents</i> view will be elaborated in their dedicated section below.</p>
        <h5>3. Hit Mode & Reaction Mode</h5>
        <p>For the DMG numbers shown in GO, the <b>Hit Mode</b> determines how they are calculated: </p>
        <ul className="mb-0">
          <li><b>Avg. DMG:</b> The damage is averaged over CRIT Rate & CRIT DMG.</li>
          <li><b>Non Crit DMG:</b> The damage of a non-crit hit. CRIT Rate & CRIT DMG are not part of the calculations.</li>
          <li><b>Crit Hit DMG:</b> The damage of a  crit hit. CRIT Rate is ignored. Only CRIT DMG is part of the calculations.</li>
        </ul>
        <p>A character's damage changes drastically when they do an amplifing reaction, like <span className="text-vaporize">Vaporize</span> or <span className="text-melt">Melt</span>. You can enable the <b>Reaction Mode</b> from this toggle.</p>
      </Col>
      <Col xs={12} lg={6} xl={5} >
        <Image src={overview} className="w-100 h-auto" />
      </Col>
    </Row>
    <Row>
      <Col xs={12} lg={6} xl={5} >
        <Image src={enemyEditor} className="w-100 h-auto" />
      </Col>
      <Col xs={12} lg={6} xl={7} >
        <h5>4. Enemy Editor & Calculation details.</h5>
        <p>This UI is usually Hidden. You need to expand it by clicking on the <Badge variant="info"><FontAwesomeIcon icon={faWindowMaximize} /> Expand</Badge> Button.</p>
        <h6>4.1 Enemy Editor</h6>
        <p>For the calculated numbers in GO to truely reflect in-game numbers, the exact enemy conditions must be replicated. This means that the relevant enemy resistance/level must be set here. </p>
        <h6>4.2 Calculation details</h6>
        <p>For every number calculated by a formula, GO will display exactly how exactly that number is calculated. Just click on the number to show the full calculations.</p>
      </Col>
    </Row>
    <Row>
      <Col>
        <h5>5. Character Overview</h5>
        <p>Contains general character information. Setting the <b>level</b> in this UI changes the calculations for damage, but it does NOT change the stats in the editor. Only the Template Level can change the base stats in the editor.</p>
        <p>You can also set the constellations of the character here by clicking on the icons.</p>
      </Col>
    </Row>
    <Row>
      <Col>
        <h5>6. Weapon Editor</h5>
        <p>Shows the weapon description & stats. You can change the weapon by clicking on the <Badge variant="info"><FontAwesomeIcon icon={faEdit} /> EDIT</Badge> Button.</p>
        <p>Some weapons have passives that provide additional stats. You can enable them to provide more real-time stats to the character, as well as provide more base stats to the Build Generator. In the image, the <i>Whiteblind</i> passive is fully stacked.</p>
      </Col>
    </Row>
    <div>
      <h5>7. Stats Editor</h5>
      <p>These sections shows the calculated stats, from weapons/artifacts/talents. To change the base value of a stat or to add a external buff/debuff to a stat, click on the <Badge variant="info"><FontAwesomeIcon icon={faEdit} /> EDIT</Badge> Button, and overwrite the stat in question. A overwritten stat will show up in yellow.</p>
    </div>
    <div>
      <h5>8. Share character</h5>
      <p>Do you want to share your character build with friends? Click on the <Badge variant="info"><FontAwesomeIcon icon={faLink} /> Share Character</Badge> button, which will generate a URL that you can share.</p>
    </div>
    <Row className="mb-2">
      <Col xs={12} lg={4} >
        <Image src={ArtifactView} className="w-100 h-auto" />
      </Col>
      <Col xs={12} lg={4} >
        <div>
          <h4>Artifact View</h4>
          <p>The top half of the artifact view shows a overview of the character stats, as well as all the formula results from a character.</p>
          <p>The bottom half of the artifact view shows the equipped artifacts on your character. If the artifact set has a condtional effect, you can enable it here.</p>
        </div>
        <div>
          <h4>Talent View</h4>
          <p>This page shows all the detailed character talent/constellations details. This is also the place to set your talent levels of your talents.</p>
          <p>If a character's autos can be infused with an element from their talents(e.g. <i>Chongyun's Spirit Blade: Chonghua's Layered Frost</i>), this will need to be manually enabled here.</p>
          <p>Any conditional stats from talents can be enabled here. </p>
        </div>
      </Col>
      <Col xs={12} lg={4} >
        <Image src={TalentView} className="w-100 h-auto" />
      </Col>
    </Row>
  </>
}