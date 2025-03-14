import { range } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/sr/assets-data'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { rarityColors } from '../../assets/assets'
import { hsrURL } from '../../lib/util'
import { clean } from '../archive'

const superimpositions: Record<string, string> = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
}

function getDropdown(id: string, superimposition: string) {
  const options: StringSelectMenuOptionBuilder[] = []
  range(1, 5).forEach((i) => {
    const r = String(i - 1)
    const option = new StringSelectMenuOptionBuilder()
      .setLabel(`Superimposition ${i}`)
      .setValue(r)
    if (superimposition === r) option.setDefault(true)
    options.push(option)
  })
  return [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`databank lightcone ${id} ${superimposition}`)
        .setPlaceholder(`Superimposition ${superimposition}`)
        .addOptions(options),
    ),
  ]
}

export function lightconeBank(
  id: LightConeKey,
  name: string,
  data: any,
  args: string,
) {
  const msg: any = {}
  //weapon rarity color
  const rarity = allStats['lightCone'][id].rarity
  //default r1 5stars
  let superimposition = '0'
  //r5 for 3/4 star
  if (rarity < 5) superimposition = '4'
  //user input override
  if (args) superimposition = args
  //name and passive
  name += ` (S${superimpositions[superimposition]})`
  const text = `\n\n**${data.passive.name}:** ` + data.passive.description
  //thumbnail
  const thumbnail = AssetData.lightCones[id].icon
  //create dropdown menu
  msg['components'] = getDropdown(id, superimposition)
  //set content
  msg['embeds'] = [
    new EmbedBuilder()
      .setTitle(name)
      .setColor(rarityColors[rarity - 1])
      .setFooter({
        text: 'Light Cone Databank',
      })
      .setDescription(clean(text))
      .setThumbnail(hsrURL('equipment/medium', thumbnail)),
  ]
  return msg
}
