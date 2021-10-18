import { faDiscord, faGithub, faPatreon, faPaypal, faReact } from "@fortawesome/free-brands-svg-icons"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ExpandMore, Scanner } from "@mui/icons-material"
import { Box, Button, CardContent, CardHeader, CardMedia, Collapse, Grid, Link, Typography } from "@mui/material"
import { useState } from "react"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import CardDark from "../Components/Card/CardDark"
import CardLight from "../Components/Card/CardLight"
import ExpandButton from "../Components/ExpandButton"
import art_editor from './art_editor.png'
import build_generator from './build_generator.png'
import character_editor from './character_editor.png'
import talent_screen from './talent_scr.png'
import tools from './tools.png'

function FeatureCard({ image, title, content, t }) {
  const [expanded, setExpanded] = useState(false);

  return <CardLight >
    <CardContent sx={{ p: 1, pb: 0 }}>
      <CardMedia component="img" image={image} alt="test" sx={{ width: "100%", height: "auto" }} />
    </CardContent>
    <CardHeader
      action={
        <ExpandButton
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMore />
        </ExpandButton>
      }
      titleTypographyProps={{ variant: "subtitle1" }}
      title={title(t)}
    />
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        {content(t)}
      </CardContent>
    </Collapse>
  </CardLight >
}

const features = [{
  image: art_editor,
  title: t => <Link component={RouterLink} to="/artifact">
    <Trans i18nKey="features.artifact.title" t={t}>
      Artifact Editor & Inventory
    </Trans>
  </Link>,
  content: t => <Typography component="div" variant="body1" color="text.secondary" >
    <Trans i18nKey="features.artifact.content" t={t}>
      <ul>
        <li>Fully featured Artifact editor.</li>
        <li>Add Artifacts by scanning a screenshot.</li>
        <li>Automatically calculate the exact rolled value of each artifact.</li>
        <li>Calculate substat efficiency, using the roll calculations. Use a single number to determine whether to keep or trash an artifact!</li>
        <li>Maintains a completely sortable, filterable artifact inventory.</li>
        <li>Imports artifact database from <Link component={RouterLink} to="/scanner">3rd party automatic scanners</Link>.</li>
      </ul>
    </Trans>
  </Typography>
}, {
  image: character_editor,
  title: t => <Link component={RouterLink} to="/character" >
    <Trans i18nKey="features.characterEditor.title" t={t}>
      Character & Weapon Editor
    </Trans>
  </Link>,
  content: t => <Typography component="div" variant="body1" color="text.secondary" >
    <Trans i18nKey="features.characterEditor.content" t={t}>
      <ul>
        <li>Fully featured Character editor.</li>
        <li>Automatically populate character stats at every milestone level/ascension.</li>
        <li>Fully editable stats for customization.</li>
        <li>Calculate current stats based on weapon/artifacts.</li>
        <li>Fully featured weapon editor, with milestone level/ascension stats</li>
        <li>Apply conditional passives, from talents & weapons & artifacts to accurately mimic in-game conditions. </li>
      </ul>
    </Trans>
  </Typography>
}, {
  image: talent_screen,
  title: t => <Link component={RouterLink} to="/character" >
    <Trans i18nKey="features.characterCalc.title" t={t}>
      Character Damage Calculations
    </Trans>
  </Link>,
  content: t => <Typography component="div" variant="body1" color="text.secondary" >
    <Trans i18nKey="features.characterCalc.content" t={t}>
      <ul>
        <li>All the details for every character's talents.</li>
        <li>All numbers should reflect real in game damage (within 1% error).</li>
        <li>Conditional stats and modifications from every Constellation accounted for.</li>
        <li>Shows calculations for all the numbers, along with formulas.</li>
        <li>Enemy editor with level/ resistance fields to customize damage calculations.</li>
        <li>Account for elemental infusion for normal/charged/plunging attacks.</li>
        <li>Real time damage calculations.</li>
      </ul>
    </Trans>
  </Typography>
}, {
  image: build_generator,
  title: t => <Link component={RouterLink} to="/build" >
    <Trans i18nKey="features.build.title" t={t}>
      Build Generator
    </Trans>
  </Link>,
  content: t => <Typography component="div" variant="body1" color="text.secondary" >
    <Trans i18nKey="features.build.content" t={t}>
      <ul>
        <li>Generates builds for specific characters using artifact inventory.</li>
        <li>Allows the maximization of character build based on specified optimization target.</li>
        <li>Limit builds by artifact sets, main stats...</li>
        <li>Fully featured build settings to fine-tune build results.</li>
        <li>Compare generated artifact build against artifacts currently on character.</li>
        <li>Use conditional stats from artifact sets, e.g. Embled of Severed Fate's 4-set Elemental Burst DMG Bonus conversion, as part of the build calculations.</li>
      </ul>
    </Trans>
  </Typography>
}, {
  image: tools,
  title: t => <Link component={RouterLink} to="/tools" >
    <Trans i18nKey="features.tools.title" t={t}>
      Tools and Gadgets
    </Trans>
  </Link>,
  content: t => <Typography component="div" variant="body1" color="text.secondary" >
    <Trans i18nKey="features.tools.content" t={t}>
      <ul>
        <li>Server time, with countdown to reset.</li>
        <li>Resin Counter.</li>
        <li>Experience Calculator, to optimize EXP. books usage.</li>
      </ul>
    </Trans>
  </Typography>
}]

function ABtn({ href, icon, children }) {
  return <Button variant="text" size="small" component="a" href={href} target="_blank" rel="noreferrer" startIcon={icon}>{children}</Button>
}
export default function HomeDisplay() {
  const { t } = useTranslation("page_home")
  ReactGA.pageview('/home')
  return <Box sx={{
    mt: 1,
    "> div": { mb: 1 },
  }}>
    <CardDark>
      <CardContent>
        <Trans i18nKey="intro" t={t}>
          <Typography variant="h5" gutterBottom >
            What is Genshin Optimizer?
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom >
            Genshin Optimizer (GO) is an open-source fan-made website for the action-RPG gacha game <Link href="https://genshin.mihoyo.com/" target="_blank" rel="noreferrer"><strong>Genshin Impact</strong></Link>.
            It is mainly intended to help players with the complex aspect of the game: Artifact Optimization.
            Since artifacts are heavily RNG-based elements that directly contribute to how effective your characters are in the game, GO will try to find the best artifacts for your characters based on your current artifact inventory.
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            GO can keep track of your artifacts, and allows more ease in filtering/comparing artifacts, it serves as a tool to help user find good artifacts in their inventory to level up, and bad artifacts to use as fodder.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Since GO can replicate the exact stats of any character, along with calculate all their damage numbers to up 1% accuracy, it can also serve as a Damage calculator, and a tool for theory crafting.
          </Typography>
        </Trans>
      </CardContent>
    </CardDark>
    <CardDark sx={{ width: "100%" }}  >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <Trans i18nKey="quickLinks.title" t={t}>
            Quick Links
          </Trans>
        </Typography>
        <CardLight sx={{ mb: 1, }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Trans i18nKey="quickLinks.scannerTitle" t={t}>
                Do you want to automate some of the artifact input process?
              </Trans>
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              <Trans i18nKey="quickLinks.scannerText" t={t}>
                Here is a list of compatible automatic scanners that can feed data into GO. These programs will automatically scan artifacts from your game, and exporting that data into a file. This file can then be imported to GO.
              </Trans>
            </Typography>
            <Button component={RouterLink} size="small" to="/scanner" variant="contained" startIcon={<Scanner />}>
              <Trans i18nKey="quickLinks.scannerBtn" t={t}>
                Scanner List
              </Trans>
            </Button>
          </CardContent>
        </CardLight>
        <CardLight>
          <CardContent>
            <Typography variant="body1" color="text.secondary" gutterBottom >
              <Trans i18nKey="quickLinks.goGithubText" t={t}>
                GO is completely open-source, written in TypeScript, with the <FontAwesomeIcon icon={faReact} />React framework.
              </Trans>
            </Typography>
            <Button size="small" variant="contained" component="a" href={process.env.REACT_APP_GITHUB_LINK} target="_blank" rel="noreferrer" startIcon={<FontAwesomeIcon icon={faGithub} />}>
              <Trans i18nKey="quickLinks.goGithubBtn" t={t}>
                Genshin Optimizer Github
              </Trans>
            </Button>
          </CardContent>
        </CardLight>

      </CardContent>
    </CardDark>
    <CardDark>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <Trans i18nKey="features.title" t={t}>
            Features
          </Trans>
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, i) => <Grid item xs={12} md={4} key={i}>
            <FeatureCard {...feature} t={t} />
          </Grid>)}
        </Grid>
      </CardContent>
    </CardDark>
    <CardDark>
      <Grid container>
        <Grid item xs={12} md={6}>
          <CardContent >
            <Trans i18nKey="helpDe" t={t}>
              <Typography variant="h5" gutterBottom >
                Want to help the developer?
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom >
                If you want to financially support the developer, please consider donating via <ABtn href={process.env.REACT_APP_PAYPAL_LINK} icon={<FontAwesomeIcon icon={faPaypal} />}>Paypal</ABtn> or <ABtn href={process.env.REACT_APP_PATREON_LINK} icon={<FontAwesomeIcon icon={faPatreon} />}>Patreon</ABtn>
                . GO does not host ads, and will not lock any features behind a paywall.
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom >
                If you want to help with localization/translation of GO to your native language, request a feature or report a bug, join our <ABtn href={process.env.REACT_APP_DISCORD_LINK} icon={<FontAwesomeIcon icon={faDiscord} />}>discord</ABtn>. This is where you will find more GO-related information, and checkout what is being actively worked on.
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom >
                You can also join the <ABtn href={process.env.REACT_APP_DEVDISCORD_LINK} icon={<FontAwesomeIcon icon={faDiscord} />}>Genshin Dev discord</ABtn> if you are interested in creating Genshin apps.
              </Typography>
            </Trans>
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardContent sx={{ width: "100%", height: "100%", minHeight: 300 }}>
            <iframe src={process.env.REACT_APP_DISCORD_EMBED_LINK} width="100%" height="100%" frameBorder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" title="discordFrame"></iframe>
          </CardContent>
        </Grid>
      </Grid>
    </CardDark>
    <CardDark>
      <CardContent>
        <Trans i18nKey="credits" t={t}>
          <Typography variant="h5" gutterBottom >
            Credit where credit is due
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom >
            GO is the culmination of hundreds of hours of programming/designing by two maintainers, <ABtn href={process.env.REACT_APP_FRZYC_LINK} icon={<FontAwesomeIcon icon={faUser} />}><strong> frzyc</strong></ABtn> and <ABtn href={process.env.REACT_APP_LANTUA_LINK} icon={<FontAwesomeIcon icon={faUser} />}><strong> lantua</strong></ABtn>. There are also a ton of other resources that aid in the creation of this website. Time to take a bow and thank them.
          </Typography>
          <Typography component="div" variant="body1" color="text.secondary" >
            <ul>
              <li>Thanks to everyone in the community, and especially people on our <Link href={process.env.REACT_APP_DISCORD_LINK} target="_blank" rel="noreferrer">discord</Link> for providing feedback and helping us improve this tool.</li>
              <li>Thanks to <Link href="https://github.com/Dimbreath" target="_blank" rel="noreferrer">Dimbreath</Link>, for giving us a reliable, consistent source for Genshin data and numbers. All our calculations would be moot without them.</li>
              <li>Some of our Genshin images are directly yoinked from <Link href="https://genshin-impact.fandom.com/" target="_blank" rel="noreferrer">The Genshin Impact Wiki</Link>, so a serendipitous thanks for them.</li>
              <li>Special thanks to members of our community who has gone the extra mile, and has been helping us with localization/translation of GO to other languages, help us test formulas by recording in-game data, and programmers who has helped us with source code contributions.</li>
              <li>Thanks for everyone else, for sharing this tool, and getting more people to use this tool.</li>
              <li>Lastly, and most importantly, thank <strong>YOU</strong>, for using GO right now.</li>
            </ul>
          </Typography>
        </Trans>
      </CardContent>
    </CardDark>
  </Box>
}
