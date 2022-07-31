const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const config = require('../../config/config')
const productModel = require('../../models/productModel')
const functions = require('../../utils/functions')
const ms = require('ms')

module.exports = {
    permission: 'ADMINISTRATOR',
    data: new SlashCommandBuilder()
        .setName('product')
        .setDescription('Manage all products on the server')
        .addSubcommand(o=>
            o.setName('create')
            .setDescription('Create a new product')
            .addStringOption(o=>
                o.setName('name')
                .setDescription('Enter a name')
                .setRequired(true)
            )
            .addStringOption(o=>
                o.setName('version')
                .setDescription('Enter a version')
                .setRequired(true)
            )
            .addIntegerOption(o=>
                o.setName('price')
                .setDescription('Enter a price')
                .setRequired(true)
            )
        )
        .addSubcommand(o=>
            o.setName('delete')
            .setDescription('Delete a existing product')
            .addStringOption(o=>
                o.setName('product')
                .setDescription('Enter a product')
                .setRequired(true)
            )
        )    
        .addSubcommand(o=>
            o.setName('list')
            .setDescription('Get all products of the server')
        )
        .addSubcommand(o=>
            o.setName('info')
            .setDescription('Get info of a product')
            .addStringOption(o=>
                o.setName('product')
                .setDescription('Enter a product')
                .setRequired(true)
            )
        )
        .addSubcommand(o=>
            o.setName('edit')
            .setDescription('Edit a existing product')
            .addStringOption(o=>
                o.setName('product')
                .setDescription('Enter a product')
                .setRequired(true)
            )
        ),

    async run(client, interaction) {
        if (interaction.options.getSubcommand() === 'create') {
            const name = interaction.options.getString('name')
            const version = interaction.options.getString('version')
            const price = interaction.options.getInteger('price')
            
            const check = await productModel.findOne({ name: name })
            if (check) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('This product already exists').setColor('RED')
                    .setDescription('The product is already created, edit the product or choose other name for new product...')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})
            const product = new productModel({
                name: name,
                version: version,
                price: price,
                purchases: 0,
                createdby: interaction.user.tag,
                createdat: new Date(),
            })
            await product.save()

            return interaction.reply({embeds: [
                new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTitle('New product created').setColor('GREEN')
                    .addField('**❯ Product name:**', `${name}`)
                    .addField('**❯ Product version:**', `v${version}`)
                    .addField('**❯ Product price:**', `$${price}`)
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setTimestamp()
            ], ephemeral: true})
        }
        if (interaction.options.getSubcommand() === 'delete') {
            const productString = interaction.options.getString('product')
            const products = await productModel.find()
            const product = products.find((p)=> p.name.toLowerCase() == productString.toLowerCase())
            if (!product) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('The product dont exists').setColor('RED')
                    .setDescription('Please enter a valid product, the entered product is already deleted')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})
            
            await interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Delete a Product?').setColor('ORANGE')
                    .setDescription('Are you sure to do this? if you delete the product you cant revert the action... yes/no')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , components: [ new MessageActionRow()
                .addComponents(
                new MessageButton()
                    .setEmoji('✅')
                    .setStyle('SECONDARY')
                    .setCustomId('yes'),
                new MessageButton()
                    .setEmoji('❌')
                    .setStyle('SECONDARY')
                    .setCustomId('no'))], ephemeral: true}).then(async()=>{
                        const message = await interaction.fetchReply()
                        const collector = message.createMessageComponentCollector({
                            filter: (m)=>m.user.id === interaction.member.id,
                            componentType: 'BUTTON',
                            time: 600000,
                        })
                        collector.on('collect',async(i)=>{
                            await i.deferUpdate()
                            if (i.customId === 'yes') {
                                product.delete()
                                return interaction.editReply({
                                    embeds: [ new MessageEmbed()
                                        .setAuthor({
                                            name: interaction.user.tag,
                                            iconURL: interaction.user.avatarURL()
                                        }).setTitle('Product Deleted').setColor('GREEN')
                                        .setDescription('Product was sussesfuly deleted, to create other product use /product create')
                                        .setFooter({
                                            text: config.name,
                                            iconURL: config.bot.icon
                                        })
                                        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                        .setTimestamp()]
                                    , components: []})
                            } else {
                                return interaction.editReply({
                                    embeds: [ new MessageEmbed()
                                        .setAuthor({
                                            name: interaction.user.tag,
                                            iconURL: interaction.user.avatarURL()
                                        }).setTitle('Process Cancelled').setColor('GREEN')
                                        .setDescription('The remove product process was canceled, the product wasnt deleted')
                                        .setFooter({
                                            text: config.name,
                                            iconURL: config.bot.icon
                                        })
                                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                                        .setTimestamp()]
                                    , components: []})
                            }
                        })
                    })
        }
        if (interaction.options.getSubcommand() === 'list') {
            const products = await productModel.find()
            if (!products || products.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('No products found').setColor('RED')
                    .setDescription('This server dont have any product to license\nyou can create products with /product create')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})
            let iname = products.map((p,a)=>`${a+1}: ${p.name} [${p.price === 0 ? 'FREE' : `$${p.price}`}]`)
            return await interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Product list').setColor('GREEN')
                    .setDescription('Here is the product list, to get a product information use /product info... If you want see the license list you can use /license list. You can delete products using /product delete and create products using /product create or /product edit to edit a product')
                    .addField('**» Your products**', '```yaml\n'+iname.join('\n')+'```')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setTimestamp()]
            , ephemeral: true})
        }
        if (interaction.options.getSubcommand() === 'info') {
            const productString = interaction.options.getString('product')
            const products = await productModel.find()
            const product = products.find((p)=> p.name.toLowerCase() == productString.toLowerCase())
            if (!product) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('The product dont exists').setColor('RED')
                    .setDescription('Please enter a valid product, the entered product is already deleted')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
            return await interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTitle('Product Information').setColor('GREEN')
                    .addField('**Product Name**', product.name, true)
                    .addField('**Version**', product.version, true)
                    .addField('**Price**', product.price == 0 ? 'FREE' : `$${product.price}`, true)
                    .addField('**Purchases**', product.purchases == 0 ? 'None' : `${product.purchases}`, true)
                    .addField('**Download**', !product.download ? 'None' : `${product.download}`, true)
                    .addField('**Created by**', product.createdby ? product.createdby : 'None', true)
                    .addField('**Created at**', `<t:${(product.createdat / 1000 | 0)}:f>`, true)
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    }).setTimestamp()]
                , ephemeral: true})
        }
        if (interaction.options.getSubcommand() === 'edit') {
            const productString = interaction.options.getString('product')
            const products = await productModel.find()
            const product = products.find((p)=> p.name.toLowerCase() == productString.toLowerCase())
            if (!product) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('The product dont exists').setColor('RED')
                    .setDescription('Please enter a valid product, the entered product is already deleted')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
                , ephemeral: true
            })
            const rowedit = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel('Name')
                    .setCustomId('name')
                    .setStyle('SUCCESS')
                    .setEmoji('📝'),
                new MessageButton()
                    .setLabel('Version')
                    .setCustomId('version')
                    .setStyle('SUCCESS')
                    .setEmoji('🛠'),
                new MessageButton()
                    .setLabel('Price')
                    .setCustomId('price')
                    .setStyle('SUCCESS')
                    .setEmoji('💰'),
                new MessageButton()
                    .setLabel('Download')
                    .setCustomId('download')
                    .setStyle('SUCCESS')
                    .setEmoji('⬇️'),
                new MessageButton()
                    .setLabel('Reset Purchases')
                    .setCustomId('purchases')
                    .setStyle('SUCCESS')
                    .setEmoji('❌')
            )
            await interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    })
                    .setTitle('Product Information').setColor('GREEN')
                    .addField('**Product Name**', product.name, true)
                    .addField('**Version**', product.version, true)
                    .addField('**Price**', product.price == 0 ? 'FREE' : `$${product.price}`, true)
                    .addField('**Purchases**', product.purchases == 0 ? 'None' : `${product.purchases}`, true)
                    .addField('**Created by**', product.createdby ? product.createdby : 'None', true)
                    .addField('**Created at**', `<t:${(product.createdat / 1000 | 0)}:f>`, true)
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    }).setTimestamp()]
                , components: [rowedit], ephemeral: true})
                const msg = await interaction.fetchReply()
                const collector = msg.createMessageComponentCollector({
                    filter: (i)=>i.user.id === interaction.user.id && i.customId,
                    time: ms('1m'),
                    max: 1
                })
                collector.on('collect',async(i)=>{
                    await i.deferUpdate()
                    if (i.customId == 'name') {
                        const name = (await functions.ask({
                            embeds: [new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Edit Product (Name)').setColor('YELLOW')
                                .setDescription('Set the new value for the name typing in this channel! you can cancel typing cancel in the channel')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                .setTimestamp()]
                        , components: []}, interaction, false)).content
                        const fm = await interaction.fetchReply()
                        if (functions.cancelask(fm, name, interaction)) return
                        await product.updateOne({
                            name: name
                        })
                        await product.save()
                        await interaction.fetchReply()
                        return interaction.editReply({
                            embeds: [ new MessageEmbed() 
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Product Edited (Name)').setColor('GREEN')
                                .setDescription(`I sussesfuly changued the product name !`)
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                .setTimestamp()]
                        })
                    }
                    if (i.customId === 'version') {
                        const version = (await functions.ask({
                            embeds: [new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Edit Product (Version)').setColor('YELLOW')
                                .setDescription('Set the new value for the version typing in this channel! you can cancel typing cancel in the channel')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                .setTimestamp()]
                        , components: []}, interaction, false)).content
                        const fm = await interaction.fetchReply()
                        if (functions.cancelask(fm, version, interaction)) return
                        await product.updateOne({
                            version: version
                        })
                        await product.save()
                        await interaction.fetchReply()
                        return interaction.editReply({
                            embeds: [ new MessageEmbed() 
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Product Edited (Version)').setColor('GREEN')
                                .setDescription(`I sussesfuly changued the product version !`)
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                .setTimestamp()]
                        })
                    }
                    if (i.customId === 'price') {
                        const pricei = (await functions.ask({
                            embeds: [new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Edit Product (Price)').setColor('YELLOW')
                                .setDescription('Set the new value for the price typing in this channel! you can cancel typing cancel in the channel')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                .setTimestamp()]
                        , components: []}, interaction, false)).content
                        let price
                        const fm = await interaction.fetchReply()
                        if (functions.cancelask(fm, pricei, interaction)) return
                        if (pricei.toLowerCase() == 'none' || !parseInt(pricei)) price = 0
                        else price = parseInt(pricei)
                        await product.updateOne({
                            price: price
                        })
                        await product.save()
                        await interaction.fetchReply()
                        return interaction.editReply({
                            embeds: [ new MessageEmbed() 
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Product Edited (Price)').setColor('GREEN')
                                .setDescription(`I sussesfuly changued the product price !`)
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                .setTimestamp()]
                        })
                    }
                    if (i.customId === 'download') {
                        const download = (await functions.ask({
                            embeds: [new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Edit Product (Download Link)').setColor('YELLOW')
                                .setDescription('Set the new value for the download link typing in this channel! you can cancel typing cancel in the channel')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                .setTimestamp()]
                        , components: []}, interaction, false)).content
                        const fm = await interaction.fetchReply()
                        if (functions.cancelask(fm, download, interaction)) return
                        await product.updateOne({
                            download: download
                        })
                        await product.save()
                        await interaction.fetchReply()
                        return interaction.editReply({
                            embeds: [ new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Product Edited (Download)').setColor('GREEN')
                                .setDescription(`I sussesfuly changued the download link !`)
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                .setTimestamp()]
                        })
                    }
                    if (i.customId === 'purchases') {
                        await interaction.editReply({
                            embeds: [ new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Reset the product purchases?').setColor('YELLOW')
                                .setDescription('Are you sure to do this? if you reset the product purchase you cant revert the action... yes/no')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                .setTimestamp()]
                        , components: [ new MessageActionRow()
                            .addComponents(
                            new MessageButton()
                                .setEmoji('✅')
                                .setStyle('SECONDARY')
                                .setCustomId('yes'),
                            new MessageButton()
                                .setEmoji('❌')
                                .setStyle('SECONDARY')
                                .setCustomId('no')
                            )
                       ], ephemeral: true}).then(async()=>{
                            const message = await interaction.fetchReply()
                            const collector = message.createMessageComponentCollector({
                                filter: (m)=>m.user.id === interaction.member.id,
                                componentType: 'BUTTON',
                                time: 600000,
                            })
                            collector.on('collect', async(i)=>{
                                await i.deferUpdate()
                                if (i.customId === 'yes') {
                                    await product.updateOne({
                                        purchases: 0
                                    })
                                    await product.save()
                                    await interaction.fetchReply()
                                    return interaction.editReply({
                                        embeds: [ new MessageEmbed()
                                            .setAuthor({
                                                name: interaction.user.tag,
                                                iconURL: interaction.user.avatarURL()
                                            }).setTitle('Product purchases reseted').setColor('GREEN')
                                            .setDescription('The product was sussesfuly reseted the purchases')
                                            .setFooter({
                                                text: config.name,
                                                iconURL: config.bot.icon
                                            })
                                            .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                            .setTimestamp()]
                                    , components: []})
                                } else {
                                    return interaction.editReply({
                                        embeds: [ new MessageEmbed()
                                            .setAuthor({
                                                name: interaction.user.tag,
                                                iconURL: interaction.user.avatarURL()
                                            }).setTitle('Process Cancelled').setColor('RED')
                                            .setDescription('The purchase product reset process was canceled, the product wasnt reseted the purchases')
                                            .setFooter({
                                                text: config.name,
                                                iconURL: config.bot.icon
                                            })
                                            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                                            .setTimestamp()]
                                    , components: [], ephemeral: true})
                                }
                            })
                        })
                    }
                })
        }
    }
}