import type { AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { calc, gettargets } from '../go/calc'
import { storedata, getchardata, getuserdata, Userdata } from '../go/data'

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
        .setName('name')
        .setDescription('the character to show')
        .setAutocomplete(true)
        .setRequired(true))
    .addStringOption(option => option
        .setName('target')
        .setDescription('the target to calculate')
        .setAutocomplete(true)
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

export async function autocomplete(interaction : AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    let userdata : Userdata;
    try {
        userdata = getuserdata(interaction.user.id);
    }
    catch {
        interaction.respond([{name:"No user data", value:""}]);
        return;
    }
    const chars : string[] = userdata.characters?.map(e => e.key) || [];
    let result : string[] = [];
    switch (focused.name) {
        case 'name':
            result = chars;
        break;
        case 'target':
            const charname = interaction.options.getString('name', true);
            if (!chars.includes(charname)) {
                interaction.respond([{name:"No such character",value:""}]);
                return;
            };
            if (userdata.character?.name != charname) getchardata(interaction.user.id, charname);
            result = gettargets(userdata.character.calculator);
        break;
    }
    result = result.filter(e => e.toLowerCase().includes(focused.value.toLowerCase()));
    result = result.slice(0,25);
    interaction.respond(result.map(e => ({name:e, value:e})));
}

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
            const charname = interaction.options.getString('name', true);
            const target = interaction.options.getString('target', true);
            const userdata = getuserdata(user.id);
            let result : any;
            try {
                if (!(userdata.character?.name == charname)) getchardata(user.id, charname);
                result = calc(userdata.character.calculator, target);
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
