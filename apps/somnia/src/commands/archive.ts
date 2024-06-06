/* eslint-disable @typescript-eslint/no-var-requires */
import * as process from 'process'
import * as fs from 'fs';
import * as path from 'path';
import { EmbedBuilder } from "@discordjs/builders";
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction} from "discord.js";
import { SlashCommandBuilder } from "discord.js";

export const slashcommand = new SlashCommandBuilder()
.setName('archive')
.setDescription('Genshin Archive')
.addSubcommand(s => s
    .setName('char')
    .setDescription('Characters')
    .addStringOption(o => o
        .setName('name')
        .setDescription('Character name')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption(o => o
        .setName('talent')
        .setDescription('Talent name')
    )
)
.addSubcommand(s => s
    .setName('weapon')
    .setDescription('Weapons')
    .addStringOption(o => o
        .setName('name')
        .setDescription('Weapon name')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addIntegerOption(o => o
        .setName('refine')
        .setDescription('Refinement level')
        .setMinValue(1).setMaxValue(5)
    )
)
.addSubcommand(s => s
    .setName('artifact')
    .setDescription('Artifacts')
    .addStringOption(o => o
        .setName('name')
        .setDescription('Artifact set name')
        .setAutocomplete(true)
        .setRequired(true)
    )
)

function clean(s : string) {
    return s.replaceAll(/<\/?\w+\/?>+/g, '**');
}

const archivepath = path.join(process.env['NX_WORKSPACE_ROOT'] ?? process.cwd(), '/libs/gi/dm-localization/assets/locales/en');
const archive : Record<string, any> = {
    key: {
        char: require(path.join(archivepath, '/charNames_gen.json')),
        weapon: require(path.join(archivepath, '/weaponNames_gen.json')),
        artifact: require(path.join(archivepath, '/artifactNames_gen.json'))
    },
    char: {},
    weapon: {},
    artifact: {}
}
for (const category in archive['key']) {
    for (const name in archive['key'][category]) {
        const itempath = path.join(archivepath, `/${category}_${name}_gen.json`);
        if (fs.existsSync(itempath))
        archive[category][name] = require(itempath);
    }
}

export async function autocomplete(interaction : AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const name = (interaction.options.getString('name') ?? '').toLowerCase();
    const focus = interaction.options.getFocused(true).name;
    let reply : ApplicationCommandOptionChoiceData[] = [];

    if (focus === 'name') {
        const results = Object.keys(archive['key'][subcommand]).filter((e : string) => e.toLocaleLowerCase().includes(name));
        reply = results.slice(0,25).map((e : string) => {
            return {name:archive['key'][subcommand][e], value:e};
        });
    }

    interaction.respond(reply);
}

export async function run(interaction : ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString('name', true);

    const data = archive[subcommand][name];
    const embed = new EmbedBuilder();

    //reply = JSON.stringify(archive[subcommand][name]).replaceAll(/(<\/?\w+\/?>)+/g, '**').slice(0,2000);
    if (subcommand === 'char') {

    }
    else if (subcommand === 'weapon') {
        const refine = (interaction.options.getInteger('refine', false) ?? 1) - 1;
        console.log(refine.toString(), data.passiveDescription)
        embed
        .setTitle(data.name)
        .setDescription(clean(
            Object.values(data.description).join('\n') +
            `\n\n**${data.passiveName}:** ` +
            Object.values(data.passiveDescription[refine.toString()]).join('\n')
        ))
    }
    else if (subcommand === 'artifact') {
        embed
        .setTitle(data.setName)
        .setDescription(clean(
            `**2-Pieces:** ${data.setEffects['2']}\n`+
            `**4-Pieces:** ${data.setEffects['4']}`
        ))
    }

    interaction.reply({content: '', embeds:[embed]});
}
