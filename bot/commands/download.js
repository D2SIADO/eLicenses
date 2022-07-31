const { MessageEmbed, MessageActionRow, MessageButton } = require(`discord.js`)
const { SlashCommandBuilder } = require('@discordjs/builders')
const config = require('../../config/config')
const productModel = require('../../models/productModel')
const licenseModel = require('../../models/licenseModel')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Manage all download links for your existing products')
        .addSubcommand(o=>
            o.setName('list')
            .setDescription('Get list of your aviable products')
        )
        .addSubcommand(o=>
            o.setName('get')
            .setDescription('Get the download linf of a product')
            .addStringOption(o=>
                o.setName('product')
                .setDescription('Enter a name')
                .setRequired(true))
        ),

        async run(client, interaction) {
            if (interaction.options.getSubcommand() === 'list') {
                const products = await productModel.find()
                const licenses = await licenseModel.find({
                    discordid: interaction.user.id
                })
                if (!licenses || licenses.length == 0) return interaction.reply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('No download found').setColor('RED')
                            .setDescription('You dont have any license linked to a product')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                            .setTimestamp()]
                    , ephemeral: true})
                if (!products || products.length == 0) return interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('No products found').setColor('RED')
                        .setDescription('The server dont have any product to download...')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                        .setTimestamp()]
                , ephemeral: true})
                let productsl = []
                for (let i =0;i<licenses.length;i++) {
                    const product = products.find((p)=> p.name == licenses[i].productname)
                    if (!product) return
                    productsl.push(product)
                }
                if (!productsl || productsl.length == 0) return interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('No products found').setColor('RED')
                        .setDescription('You dont have any product for download')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                        .setTimestamp()]
                , ephemeral: true})
                let iname = productsl.map((p,a)=>`${a+1}: ${p.name} [${p.price === 0 ? 'FREE' : `$${p.price}`}]`)
                return await interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('Download product list').setColor('GREEN')
                        .setDescription('Here are the products, you can download the product using /download product...')
                        .addField('**» Your products**', '```yaml\n'+iname.join('\n')+'```')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                        .setTimestamp()]
                , ephemeral: true})
            }
            if (interaction.options.getSubcommand() === 'get') {
                const productString = interaction.options.getString('product')
                const products = await productModel.find()
                const licenses = await licenseModel.find({
                    discordid: interaction.user.id
                })
                if (!licenses || licenses.length == 0) return interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('No download found').setColor('RED')
                        .setDescription('You dont have any license linked to a product')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                        .setTimestamp()]
                , ephemeral: true})
                if (!products || products.length == 0) return interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('No products found').setColor('RED')
                        .setDescription('The server dont have any product to download...')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                        .setTimestamp()]
                , ephemeral: true})
                let productsl = []
                for (let i =0;i<licenses.length;i++) {
                    const product = products.find((p)=> p.name == licenses[i].productname)
                    if (!product) return
                    productsl.push(product)
                }
                const product = productsl.find((p)=> p.name.toLowerCase() == productString.toLowerCase())
                if (!product) return interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('Product invalid').setColor('RED')
                        .setDescription('The product entered was invalid, i cant get the download link')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                        .setTimestamp()]
                , ephemeral: true})
                if (!product.download) return interaction.reply({
                    embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        }).setTitle('Download not found').setColor('RED')
                        .setDescription('This product has not a download link, please contact to a admin...')
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                        .setTimestamp()]
                , ephemeral: true})
                    return await interaction.reply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                            }).setTitle(`Download ${product.name}`).setColor('GREEN')
                        .setDescription(`I sussesfuly generated the download link, you can go to the download page clicking the button. This message will be deleted tin 60 seconds...`)
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        })
                        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                        .setTimestamp()]
                    , ephemeral: true, components: [ new MessageActionRow()
                        .addComponents(
                        new MessageButton()
                            .setLabel('Download')
                            .setStyle('LINK')
                            .setURL(product.download))]
             })
        }
     }
}
