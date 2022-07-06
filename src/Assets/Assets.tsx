import bow from './icon_bow.png'
import catalyst from './icon_catalyst.png'
import claymore from './icon_claymore.png'
import polearm from './icon_polearm.png'
import sword from './icon_sword.png'

import fragile from './Item_Fragile_Resin.png'
import condensed from './Item_Condensed_Resin.png'

//EXP BOOKS
import advice from './Item_Wanderer\'s_Advice.png'
import wit from './Item_Hero\'s_Wit.png'
import experience from './Item_Adventurer\'s_Experience.png'

import team1 from './icon_team_1.png'
import team2 from './icon_team_2.png'
import team3 from './icon_team_3.png'
import team4 from './icon_team_4.png'

import flower from './icon_slot_flower.png'
import plume from './icon_slot_plume.png'
import sands from './icon_slot_sands.png'
import goblet from './icon_slot_goblet.png'
import circlet from './icon_slot_circlet.png'
import { SvgIcon } from '@mui/material'

const Assets = {
  weaponTypes: { bow, catalyst, claymore, polearm, sword },
  slot: {
    flower,
    plume,
    sands,
    goblet,
    circlet,
  },
  resin: {
    fragile,
    condensed
  },
  exp_books: {
    advice,
    wit,
    experience,
  },
  team: {
    team1,
    team2,
    team3,
    team4,
  },
  svg: {
    anvil: <SvgIcon>
      <path fill="currentColor" d="M9 5v5c4.03 2.47-.56 4.97-3 6v3h15v-3c-6.41-2.73-3.53-7 1-8V5H9M2 6c.81 2.13 2.42 3.5 5 4V6H2Z" />
    </SvgIcon>
  }
} as const;
export default Assets;
