const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const config = require('../config/config')
const ms = require('ms')
const chalk = require('chalk')

function noregister (interaction) {
    return interaction.reply({
        embeds: [ new MessageEmbed()
            .setAuthor({
                name: interaction.user.name,
                iconURL: interaction.user.avatarURL()
            })
            .setTitle('You are not registered')
            .setDescription('You need have a discord registered used..')
            .setFooter({
                text: 'Extreme Licenses',
                iconURL: config.bot.icon
            })
            .setColor('RED')
        ], ephemeral: true
    })
}

async function createLicenseEmbed(license, interaction, title) {
    const iplist = license.iplist.map((data, i) => {
        return `${i + 1}: ${data.ip}`;
    });
    if (iplist.length == 0) iplist.push('1: None');
    const embed = new MessageEmbed()
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL()
        })
        .setTitle('License Information').setColor('GREEN')
        .addField('**License key**', '```yaml\n' + license.keylicense + '```')
        .addField('**Client name**', license.clientname, true)
        .addField('**Discord id**', license.discordid, true)
        .addField('**Discord username**', license.discordname, true)
        .addField('**Discord tag**', license.discordtag, true)
        .addField('**Product**', license.productname, true)
        .addField('**Created by**', license.createdby ? license.createdby : 'none', true)
        .addField('**Total IP**', `${license.iplist.length}/${license.ipcap}`, true)
        .addField('**Latest IP**', license.lastip ? license.lastip : 'None', true)
        .addField('**Created at**', `<t:${(license.createdat / 1000 | 0)}:f>`, true)
        .addField('**IP List**', '```yaml\n'+ iplist.join('\n').toString() +'```', false)
        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
        .setFooter({
            text: 'Extreme Licenses',
            iconURL: config.bot.icon
        }).setTimestamp()
        if (title) embed.setTitle(title)
        return embed
}

async function countButtons(array, style = 'SECONDARY') {
    if (array.length > 10) {
        return console.error('Too many buttons! Max 10 buttons!')
    }
    const components = []
    lastComponents = new MessageActionRow
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
    for (let i = 0; i < array.length; i++) {
        const productName = array[i].name
        const button = new MessageButton()
            .setEmoji(emojis[i])
            .setCustomId(productName)
            .setStyle('SECONDARY')
        lastComponents.addComponents(button)
        if (lastComponents.components.length === 5) {
            components.push(lastComponents)
            lastComponents = new MessageActionRow()
        }
    }
    if (lastComponents.components.length > 0) {components.push(lastComponents)}
    return components
}

async function ask(question, interaction, reply = true) {
    if (reply) await interaction.reply(question);
    const message = await interaction.fetchReply();
    if (!reply) await interaction.editReply(question);
    /**@type Message */
    let answer;

    await message.channel.awaitMessages({
        filter: (m) => m.author.id === interaction.user.id,
        time: 30000,
        max: 1
    }).then((x) => {
        answer = x.first();
    });
    answer.delete();
    if (answer.content == 'cancel') {
        return false;
    }
    return answer;
}

function cancelAsk(fetchMessage, answer, interaction) {
    if (!answer) {
        interaction.editReply({embeds: [fetchMessage.embeds[0].setColor('RED').setTitle('Process Cancelled').setFields([]).setDescription('The process was cancelled because you respond with cancel in the channel chat').setImage('https://i.ibb.co/QjxPpsZ/Red.png')]})
        return true;
    } else {
        return false;
    }
}

function generateLicense (length = 25) {
    const strings = 'ABCDEFGHIJKLMNIOPQRSTUVWXYZ0123456789';
    let license = '';
    for (let i = 0; i < length; i++) {
        license += strings[Math.floor(Math.random() * strings.length)];
    }
    license = license.replace(/([a-zA-Z0-9]{5})/g, '$1-').slice(0, -1);
    return license;
}

async function paginationEmbed(interaction, emojis, embeds, timeout, ephemeral) {
    if (embeds.length <= 0) return interaction.reply({embeds: [
        new MessageEmbed()
            .setTitle('No embeds to paginate!')
            .setColor('RED')
    ], ephemeral: ephemeral})

    if (embeds.length == 1) return interaction.reply({embeds: [embeds[0]], ephemeral})

    let current = 0
    const row = (state) => [
        new MessageActionRow().addComponents(
            new MessageButton()
                .setEmoji(emojis[0])
                .setLabel(emojis[1])
                .setDisabled(state)
                .setStyle('SUCCESS')
                .setCustomId('btn1'),
            new MessageButton()
                .setEmoji(emojis[2])
                .setLabel(emojis[3])
                .setDisabled(state)
                .setStyle('SUCCESS')
                .setCustomId('btn2'),
        )
    ]

    const curPage = await interaction.reply({
        embeds: [embeds[current].setTitle(`Currently on page ${current + 1} of ${embeds.length}`)],
        components: row(false),
        fetchReply: true,
        ephemeral
    }).catch(() => { throw new Error('Cannot send messages!') })

    const collector = curPage.createMessageComponentCollector({
        filter: (m) => m.user.id === interaction.member.id,
        componentType: 'BUTTON',
        time: ms(timeout),
    })

    collector.on('collect', async (collected) => {
        if (collected.customId === 'btn1') current--
        else if (collected.customId === 'btn2') current++

        if (current < 0) current = embeds.length - 1
        if (current >= embeds.length) current = 0

        interaction.editReply({
            embeds: [embeds[current].setTitle(`Currently on page ${current + 1} of ${embeds.length}`)],
            ephemeral
        }).catch((e) => { console.error(e) })

        collected.deferUpdate()
    })

    collector.on('end', async () => {
        interaction.editReply({components: []
        }).catch((err) => { 
            console.log(err)
            console.log(chalk.red(`[!] The service will be exit because the system found a error`))
            process.exit(1)
        })
    })
}

module.exports = {
    noregister: noregister,
    paginatedEmbed: paginationEmbed,
    countButtons: countButtons,
    generateLicense: generateLicense,
    ask: ask,
    cancelask: cancelAsk,
    createLicenseEmbed: createLicenseEmbed
}