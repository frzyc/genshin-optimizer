import { SqBadge } from '@genshin-optimizer/common/ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import {
  CardContent,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'

export function Roadmap() {
  return (
    <ZCard>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <span role="img" aria-label="rocket">
            🚀
          </span>{' '}
          Roadmap to ZZZero-maxxing
        </Typography>

        <Stack spacing={2}>
          <ZCard bgt="dark">
            <CardContent>
              {/* Milestone 1 */}
              <Typography variant="h6" gutterBottom>
                <span role="img" aria-label="target">
                  🎯
                </span>{' '}
                Milestone 1: MVPish <SqBadge color="success">COMPLETED</SqBadge>
              </Typography>
              <Typography variant="body1" gutterBottom>
                A real test of "What’s the absolute <strong>least</strong> I can
                do and still call it an optimizer?" 🤡
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="❌ No datamine (we rawdoggin' the stats)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🦴 Bare bones Disc inventory" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="📸 Scan discs using screenshot tech (caveman mode engaged)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="✏️ Stats editor for solver inputs (DIY optimizer experience)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🏗️ Minimal disc filter/force sets for solver" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="📜 Napkin sketch calculations (trust me bro numbers)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🎯 General damage targets (aka 'hit big numbers around this area')" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🔄 2p Disc effects (the bare minimum™)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="💪 Brute force solver" />
                </ListItem>
              </List>
            </CardContent>
          </ZCard>

          <ZCard bgt="dark">
            <CardContent>
              {/* Milestone 2 */}
              <Typography variant="h6" gutterBottom>
                <span role="img" aria-label="lightbulb">
                  💡
                </span>{' '}
                Milestone 2: I NEED THIS{' '}
                <SqBadge color="success">COMPLETED</SqBadge>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="🧙‍♂️ Scuffed datamine via Hakushin API" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="📥 Import character & Wengine stats (No more manual typing, rejoice!)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🎭 4p Disc conditionals (because 2p ain't enough)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="📂 Disc inventory with filters (finally some organization)" />
                </ListItem>
              </List>
            </CardContent>
          </ZCard>

          <ZCard bgt="dark">
            <CardContent>
              {/* Milestone 3 */}
              <Typography variant="h6" gutterBottom>
                <span role="img" aria-label="gem">
                  💎
                </span>{' '}
                Milestone 3: I WANT THIS.{' '}
                <SqBadge color="success">COMPLETED</SqBadge>
              </Typography>
              <Typography variant="body1" gutterBottom>
                We’re entering <strong>premium optimizer experience</strong>{' '}
                territory. 🛠️✨
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="🔧 Wengine conditionals (min-maxers be eatin’ GOOD 🧠💪)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🕵️‍♂️ Advanced 2p/4p set filters (no more 💩 builds—only PEAK performance)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="❌ Auto-yeet trash builds (bad builds? Deleted. Skill issue.)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🎨 UI glow-up (no more 'made by a programmer' vibes, we fancy now 😎)" />
                </ListItem>
              </List>
            </CardContent>
          </ZCard>

          <ZCard bgt="dark">
            <CardContent>
              {/* Milestone 4: Engine Swap */}
              <Typography variant="h6" gutterBottom>
                <span role="img" aria-label="gear">
                  ⚙️
                </span>{' '}
                Milestone 4: ENGINE SWAP BABY 🚗💨{' '}
                <SqBadge color="warning">IN-PROGRESS</SqBadge>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="🔥 Pando calculation engine replaces scuffed math" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🔍 Compare different builds" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="📝 Print out math formulas (show your work, nerd)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🧠 Advanced solver optimization (Pando makes the best and fastest builds, no 🧢)" />
                </ListItem>
              </List>
            </CardContent>
          </ZCard>

          <ZCard bgt="dark">
            <CardContent>
              {/* Milestone 5 */}
              <Typography variant="h6" gutterBottom>
                <span role="img" aria-label="performing arts">
                  🎭
                </span>{' '}
                Milestone 5: Characters ARE Built Different
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="🏆 Adding in each character and targets" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="🎯 Add multi-target optimization (characters can't just one-shot)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="👥 Add team/builds (there is no 'i' in team)" />
                </ListItem>
              </List>
            </CardContent>
          </ZCard>
        </Stack>
      </CardContent>
    </ZCard>
  )
}
