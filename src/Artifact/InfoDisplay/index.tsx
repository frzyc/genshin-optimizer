import { faBan, faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Badge, Col, Image, Row } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { Stars } from '../../Components/StarDisplay'
import artifactcard from './artifactcard.png'
import artifacteditor from './artifacteditor.png'
import artifactfilter from './artifactfilter.png'
function Colors() {
  return <span>{[...Array(6).keys()].map(s => <Badge variant={`${s + 1}roll`} key={s} className="text-darkcontent ml-1"><b>{s + 1}</b></Badge>)}</span>
}
export default function ArtifactInfoDisplay() {
  const { t } = useTranslation("artifact")
  return <>
    <Row className="mb-2">
      <Col xs={12} lg={5} xl={4}>
        <Image src={artifactcard} className="w-100 h-auto" />
      </Col>
      <Col xs={12} lg={7} xl={8}>
        <Trans t={t} i18nKey="info.section1">
          <h5>Substat rolls</h5>
          <p>The <b>number of rolls</b> a substat has is shown to the left of the substat. As the number gets higher, the substat is more colorful:<Colors />.</p>

          <h5>Substat Efficiency</h5>
          <p>The Efficiency of an subtat is a percentage of the current value over the highest potential 5<Stars stars={1} /> value. From the Image, the maximum roll value of CRIT DMG is 7.8%. In efficiency: <b>5.8/7.8 = 69.2%.</b></p>

          <h5>Current substats Efficiency vs. Maximum Substats Efficiency</h5>
          <p>When a 5<Stars stars={1} /> have 9(4+5) total rolls, with each of the rolls having the highest value, that is defined as a 100% efficient artifact. However, most of the artifacts are not this lucky. The <b>Current substats Efficiency</b> of an artifact is a percentage over that 100% artifact. The <b>Maximum Substats Efficiency</b> is the maximum possible efficiency an artifact can achieve, if the remaining artifact rolls from upgrades are the hightest possible value.</p>

          <h5>Locking an artifact</h5>
          <p>By locking an artifact <FontAwesomeIcon icon={faBan} />, This artifact will not be picked up by the build generator for optimization. An equipped artifact is locked by default.</p>
        </Trans>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col xs={12} lg={6} xl={7} >
        <Trans t={t} i18nKey="info.section2">
          <h5>Artifact Editor</h5>
          <p>A fully featured artifact editor, that can accept any 3<Stars stars={1} /> to 5<Stars stars={1} /> Artifact. When a substat is inputted, it can calculate the exact roll values, and from it, the efficiency. It will also make sure that you have the correct number of rolls in the artifact according to the level, along with other metrics of validation.</p>

          <h5>Scan screenshots</h5>
          <p>Manual input is not your cup of tea? You can scan in your artifacts with screenshots! On the Artifact Editor, click the <Badge variant="info">Show Me How!</Badge> button to learn more.</p>

          <h6>Automatic Artifact Scanner</h6>
          <p>If you are playing Genshin on PC, you can download a tool that automatically scans all your artifacts for you, and you can then import that data in <FontAwesomeIcon icon={faCog} /> Database. Here is a recommended tool: <a href="https://github.com/daydreaming666/Amenoma/releases/" target="_blank" rel="noreferrer">「天目」-- Amenoma</a>.</p>

          <h5>Duplicate/Upgrade artifact detection</h5>
          <p>Did you know GO can detect if you are adding a <b>duplicate</b> artifact that exists in the system? It can also detect if the current artifact in editor is an <b>upgrade</b> of an existing artifact as well. Once a duplicate/upgrade is detected, a preview will allow you to compare the two artifacts in question(See Image).</p>
        </Trans>
      </Col>
      <Col xs={12} lg={6} xl={5}>
        <Image src={artifacteditor} className="w-100 h-auto" />
      </Col>
    </Row>
    <Row >
      <Col xs={12} lg={7} xl={6}>
        <Image src={artifactfilter} className="w-100 h-auto" />
      </Col>
      <Col xs={12} lg={5} xl={6}>
        <Trans t={t} i18nKey="info.section3">
          <h5>Artifact Inventory</h5>
          <p>All your artifacts that you've added to GO is displayed here. The filters here allow you to further refine your view of your artifacts. </p>

          <h5>Example: Finding Fodder Artifacts</h5>
          <p>By utilizing the artifact filter, and the artifact efficiency calculations, you can quickly find artifacts to feed as food.</p>
          <p className="mb-0">In this example, the filters are set thusly: </p>
          <ul>
            <li>Limit level to 0-8.</li>
            <li>Unlocked artifacts in Inventory.</li>
            <li>Removing the contribution of flat HP, flat DEF and Energy Recharge to efficiency calculations.</li>
            <li>Sorted by Ascending Max Efficiency.</li>
          </ul>
          <p>This will filter the artifact Inventory by the lowest efficiency artifacts, for desired substats.</p>
        </Trans>
      </Col>
    </Row>
  </>
}