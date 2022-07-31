const { MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const config = require('../../config/config')
const licensemodel = require('../../models/licenseModel')
const functions = require('../../utils/functions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('self')
        .setDescription('Manage your product licenses')
        .addSubcommand(o=>
            o.setName('list')
            .setDescription('Get the list of your licenses on the server')
        )
        .addSubcommand(o=>
            o.setName('cleardata')
            .setDescription('Clear the data of a specific license')
            .addStringOption(o=>
                o.setName('license')
                .setDescription('Enter the name of the license')
                .setRequired(true)
            )
        )
        .addSubcommand(o=>
            o.setName('info')
            .setDescription('Get the information of your specific license')
            .addStringOption(o=>
                o.setName('license')
                .setDescription('Enter the name of the product')
                .setRequired(true)
            )
        ),

    async run(client, interaction) {
        if (interaction.options.getSubcommand() === 'licenses') {
            const licenses = await licensemodel.find({
                discordid: interaction.user.id
            })
            if (!licenses || licenses.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('No licenses found').setColor('RED')
                    .setDescription('You dont have a active license active... you can purchase a product and get a license')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})

            let embeds = []
            for (let i=0;i<licenses.length;i++) {
                embeds.push(
                    new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('Active Licenses').setColor('GREEN')
                        .setDescription(`Here is your active licenses, if to see the licenses information use /self license\n\n**Total Licenses:** ${licenses.length}\n\n`)
                        .addField(`${licenses[i].productname} License #${i+1}`, '```yaml\n'+`License: ${licenses[i].keylicense}\nIP Useds: ${licenses[i].iplist.length+'/'+licenses[i].ipcap}\nClient Name: ${licenses[i].clientname}\nClient Account: ${licenses[i].discordtag}`+'```')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage('https://i.ibb.co/GFx981b/Green.png')
                        .setTimestamp()
                )
            }
            if (embeds.lenght == 1) return interaction.reply({
                embeds: embeds
            , ephemeral: true})
            functions.paginatedEmbed(interaction, ['⏪', 'Previous', '⏩', 'Next'], embeds, '30s', true)
        }

        if (interaction.options.getSubcommand() === 'info') {
            let licenseString = interaction.options.getString('license')
            const license = await licensemodel.findOne({
                keylicense: licenseString,
                discordid: interaction.user.id
            })
            if (!license) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid License').setColor('RED')
                    .setDescription('The entered license dosnt exists or the license are of other client discord, use /self licenses to get your aviable licenses')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp() ]
            , ephemeral: true})

            functions.createLicenseEmbed(license, interaction, 'License Information')
        }
        if (interaction.options.getSubcommand() === 'cleardata') {
            let licenseString = interaction.options.getString('license')
            const license = await licensemodel.findOne({
                keylicense: licenseString,
                discordid: interaction.user.id
            })
            if (!license || license.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid License').setColor('RED')
                    .setDescription('The entered license dosnt exists or the license are of other client discord, use /self licenses to get your aviable licenses')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp() ]
            , ephemeral: true})
            await license.updateOne({
                iplist: []
            })
            return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Cleared Data').setColor('GREEN')
                    .setDescription(`I sussesfuly cleared your IP list and data for the license, the product of the license are ${license.productname}. For more info you can use /self info`)
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setTimestamp() ]
            , ephemeral: true})
        }
    }
}