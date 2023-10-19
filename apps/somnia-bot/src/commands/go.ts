import type { ChatInputCommandInteraction} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { calc } from '../go/calc'
import { storedata, getchar } from '../go/data'

export const slashcommand = new SlashCommandBuilder()
.setName('go')
.setDescription('shows optimizer data')
.addSubcommand(subcommand => subcommand
    .setName('upload')
    .setDescription('upload your GOOD data')
    .addAttachmentOption(option => option
      .setName('data')
      .setDescription('GOOD format data')
      .setRequired(true)))
.addSubcommand(subcommand => subcommand
    .setName('char')
    .setDescription('show char info')
    .addStringOption(option => option
        .setName('char')
        .setDescription('the character to show')
        .setRequired(true))
    .addUserOption(option => option
        .setName('user')
        .setDescription('user')))
.addSubcommand(subcommand => subcommand
    .setName('artifact')
    .setDescription('show artifact info')
    .addStringOption(option => option
        .setName('filters')
        .setDescription('filters'))
    .addUserOption(option => option
        .setName('user')
        .setDescription('user')))

export async function run(interaction : ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case 'upload':
        const attachment = interaction.options.getAttachment('data', true);
        await interaction.deferReply({ephemeral:true});
        try {
          await storedata(interaction.user.id, attachment);
        }
        catch (e) {
          interaction.editReply(JSON.stringify(e, null, 2).slice(0, 2000));
          return;
        }
        interaction.editReply("Data successfully uploaded");
      return;
      case 'char':
        const user = interaction.options.getUser('user', false) || interaction.user;
        const charname = interaction.options.getString('char', true);
        let chardata : any;
        let result : any;
        try {
            chardata = getchar(user.id, charname);
            result = calc(chardata);
        }
        catch (e) {
            console.log(e);
            interaction.reply({
              content: JSON.stringify(e, null, 2).slice(0, 2000),
              ephemeral: true
            });
            return;
        }
        interaction.reply('```json\n'+JSON.stringify(result, null, 2).slice(0, 1980)+'```');
      return;
    }
}
