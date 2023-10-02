import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const slashcommand = new SlashCommandBuilder()
.setName('button')
.setDescription('Click Me!')

let clicks = 0;

function getbutton() {
  const button = new ButtonBuilder()
    .setCustomId('button')
    .setLabel(''+clicks)
    .setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(button);
  return {components: [row]};
}

export async function run(interaction : ChatInputCommandInteraction) {
  interaction.reply(getbutton());
  return;
}

export async function button(interaction : ButtonInteraction) {
  clicks++;
  interaction.update(getbutton())
  return;
}
