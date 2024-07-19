import { range } from '@genshin-optimizer/common/util'
import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { rarityColors } from '../../assets/assets'
import { createAmbrUrl } from '../../lib/util'
import { clean, translate } from '../archive'

const refinedisplay: Record<string, string> = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '5',
}

function getDropdown(id: string, lang: string, refine: string) {
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
        .setCustomId(`archive weapon ${id} ${lang} ${refine}`)
        .setPlaceholder(`Refinement ${refine}`)
        .addOptions(options)
    ),
  ]
}

export async function weaponArchive(id: WeaponKey, lang: string, args: string) {
  const namespace = `weapon_${id}_gen`
  console.log(namespace)
  await i18nInstance.loadNamespaces(namespace)
  const msg: any = {}
  let name = translate(namespace, 'name', lang)
  let text = ''
  //weapon rarity color
  const rarity = getWeaponStat(id).rarity
  //default r1 5stars
  let refine = '0'
  //no refinements or dropdown for 1/2 star weapons
  if (rarity > 2) {
    //r5 for 3/4 star weapons
    if (rarity < 5) refine = '4'
    //user input override
    if (args) refine = args
    //name and passive
    name += ` (R${refinedisplay[refine]})`
    text +=
      '\n\n**' +
      translate(namespace, 'passiveName') +
      ':** ' +
      Object.values(
        translate(namespace, `passiveDescription.${refine}`, lang, true)
      ).join('\n')
    //create dropdown menu
    msg['components'] = getDropdown(id, lang, refine)
  }
  //append lore text
  text +=
    '\n\n-# *' +
    Object.values(translate(namespace, 'description', lang, true)).join('\n') +
    '*'
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
