import { range } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { rarityColors } from '../../assets/assets'
import { createAmbrUrl } from '../../lib/util'
import { clean } from '../archive'

const refinedisplay: Record<string, string> = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
}

function getDropdown(id: string, refine: string) {
  const options: StringSelectMenuOptionBuilder[] = []
  range(1, 5).forEach((i) => {
    const r = String(i - 1)
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(`Refinement ${i}`)
      .setValue(r)
    if (refine === r) option.setDefault(true)
    options.push(option)
  })
  return [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`archive weapon ${id} ${refine}`)
        .setPlaceholder(`Refinement ${refine}`)
        .addOptions(options)
    ),
  ]
}

export function weaponArchive(
  id: WeaponKey,
  name: string,
  data: any,
  args: string
) {
  const msg: any = {}
  let text = Object.values(data.description).join('\n')
  //weapon rarity color
  const rarity = getWeaponStat(id).rarity
  //default r1 5stars
  let refine = '0'
  //no refinements or dropdown for 1/2 star weapons
  if (rarity > 2) {
    //r5 for 3/4 star weapons
    if (rarity < 5) refine = '4'
    //user input override
    if (args in refinedisplay) refine = args
    else throw 'invalid refine'
    //name and passive
    name += ` (R${refinedisplay[refine]})`
    text +=
      `\n\n**${data.passiveName}:** ` +
      Object.values(data.passiveDescription[refine]).join('\n')
    //create dropdown menu
    msg['components'] = getDropdown(id, refine)
  }
  //set content
  msg['embeds'] = [
    new EmbedBuilder()
      .setTitle(name)
      .setColor(rarityColors[rarity - 1])
      .setFooter({
        text: 'Weapon Archive',
      })
      .setDescription(clean(text))
      .setThumbnail(createAmbrUrl(AssetData.weapons[id].icon)),
  ]
  return msg
}
