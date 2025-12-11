import bow from './icon_bow.png'
import catalyst from './icon_catalyst.png'
import claymore from './icon_claymore.png'
import polearm from './icon_polearm.png'
import sword from './icon_sword.png'

import condensed from './Item_Condensed_Resin.png'
import fragile from './Item_Fragile_Resin.png'

//EXP BOOKS
import experience from './Item_Adventurers_Experience.png'
import wit from './Item_Heros_Wit.png'
import advice from './Item_Wanderers_Advice.png'

import team1 from './icon_team_1.png'
import team2 from './icon_team_2.png'
import team3 from './icon_team_3.png'
import team4 from './icon_team_4.png'

import circlet from './icon_slot_circlet.png'
import flower from './icon_slot_flower.png'
import goblet from './icon_slot_goblet.png'
import plume from './icon_slot_plume.png'
import sands from './icon_slot_sands.png'

import hexerei from './UI_BtnIcon_Hexenzirkel.png'
import moonsign from './UI_BtnIcon_MoonPhase.png'

export const imgAssets = {
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
    condensed,
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
  resonance: {
    moonsign,
    hexerei,
  },
} as const
