const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const config = require('../../config/config')
const blacklist = require('../../models/blackModel')

module.exports = {
    permission: 'ADMINISTRATOR',
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Ban a server to use development plugins')
        .addSubcommand(o =>
            o.setName('list')
                .setDescription('Get a all blacklisted servers on the development')
        )
        .addSubcommand(o =>
            o.setName('info')
                .setDescription('Get information for a blacklisted server')
                .addStringOption(o =>
                    o.setName('ip')
                        .setDescription('Enter the ip of the blacklisted server')
                        .setRequired(true))
        )
        .addSubcommand(o =>
            o.setName('add')
                .setDescription('Add a server to the blacklist')
                .addStringOption(o =>
                    o.setName('ip')
                        .setDescription('Enter the ip of the server to blacklist')
                        .setRequired(true))
                .addStringOption(o =>
                    o.setName('name')
                        .setDescription('Enter the name of the server to blacklist')
                        .setRequired(true))
                .addStringOption(o =>
                    o.setName('reason')
                        .setDescription('Enter the reason of the blacklist')
                        .setRequired(true))
        )
        .addSubcommand(o =>
            o.setName('remove')
                .setDescription('Remove a server to the blacklist')
                .addStringOption(o =>
                    o.setName('ip')
                        .setDescription('Enter the ip of the blacklisted server')
                        .setRequired(true))
        ),
    async run(client, interaction) {
        if (interaction.options.getSubcommand() === 'list') {
            const blacklisteds = await blacklist.find()
            if (!blacklisteds || blacklisteds.length == 0) return interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('No server blacklist').setColor('RED')
                    .setDescription('This development dont have a blacklisted server')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
            let servers = blacklisteds.map((s, a) => `${a + 1}: ${s.ip} [${s.name}]`)

            return await interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Blacklisted Servers').setColor('GREEN')
                    .setDescription('Here are the blacklisted servers, you can remove the blacklist using /blacklist remove')
                    .addField('**» Blacklists**', '```yaml\n' + servers.join('\n') + '```')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
        }
        if (interaction.options.getSubcommand() === 'info') {
            let ip = interaction.options.getString('ip')
            let blacklisted = await blacklist.findOne({ip:{ $regex : new RegExp(ip, "i") }})
            if (!blacklisted) return interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid Server').setColor('RED')
                    .setDescription('The server arnt blacklisted, you can blacklist using /blacklist add')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
            return await interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTitle('Blacklist Information').setColor('GREEN')
                    .setDescription('Here are the information for the blacklisted server, you can remove the blacklist with /blacklist remove')
                    .addField('**Ip**', blacklisted.name, true)
                    .addField('**Name**', blacklisted.ip, true)
                    .addField('**Reason**', '```' + blacklisted.reason + '```', false)
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    }).setTimestamp()]
                , ephemeral: true
            })
        }
        if (interaction.options.getSubcommand() === 'add') {
            let ip = interaction.options.getString('ip')
            let name = interaction.options.getString('name')
            let reason = interaction.options.getString('reason')
            const check = await blacklist.findOne({ip:{ $regex : new RegExp(ip, "i") }})
            if (check) return interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('This server is already blacklist').setColor('RED')
                    .setDescription('The entered server was already blacklist, you can remove the blacklist using /blacklist remove')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
            const newblacklist = new blacklist({
                ip: ip,
                name: name,
                reason: reason
            })
            await newblacklist.save()
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setTitle('New blacklist').setColor('GREEN')
                        .addField('**» Ip:**', `${ip}`)
                        .addField('**» Name:**', `${name}`)
                        .addField('**» Reason:**', `${reason}`)
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                        .setTimestamp()
                ], ephemeral: true
            })
        }
        if (interaction.options.getSubcommand() === 'remove') {
            let ip = interaction.options.getString('ip')
            let blacklisted = blacklist.findOne({ip:{ $regex : new RegExp(ip, "i") }})
            if (!blacklisted) return interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid Server').setColor('RED')
                    .setDescription('The server arnt blacklisted, you can blacklist using /blacklist add')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Delete a server blacklist?').setColor('ORANGE')
                    .setDescription('Are you sure to do this? if you delete the blacklist you cant revert the action... yes/no')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , components: [new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setEmoji('✅')
                            .setStyle('SECONDARY')
                            .setCustomId('yes'),
                        new MessageButton()
                            .setEmoji('❌')
                            .setStyle('SECONDARY')
                            .setCustomId('no'))], ephemeral: true
            }).then(async () => {
                const message = await interaction.fetchReply()
                const collector = message.createMessageComponentCollector({
                    filter: (m) => m.user.id === interaction.member.id,
                    componentType: 'BUTTON',
                    time: 600000,
                })
                collector.on('collect', async (i) => {
                    await i.deferUpdate()
                    if (i.customId === 'yes') {
                        await blacklist.deleteOne()
                        return interaction.editReply({
                            embeds: [new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Removed Server').setColor('GREEN')
                                .setDescription('Blacklist server was sussesfuly deleted, to create other product use /blacklist add')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                .setTimestamp()]
                            , components: []
                        })
                    } else {
                        return interaction.editReply({
                            embeds: [new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Process Cancelled').setColor('GREEN')
                                .setDescription('The remove product process was canceled, the server blacklist wasnt deleted')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                                .setTimestamp()]
                            , components: []
                        })
                    }
                })
            })
        }
    }
}