const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const config = require('../../config/config')
const licenseModel = require('../../models/licenseModel')
const productModel = require('../../models/productModel')
const functions = require('../../utils/functions')
const product = require('./product')
const ms = require('ms')

module.exports = {
    permission: 'ADMINISTRATOR',
    data: new SlashCommandBuilder()
        .setName('license')
        .setDescription('Manage the ')
        .addSubcommand(o=>
            o.setName('create')
            .setDescription('Create a new license')
        )
        .addSubcommand(o=>
            o.setName('delete')
            .setDescription('Delete a specific license')
            .addStringOption(o=>
                o.setName('license')
                .setDescription('Enter the name of the license')
                .setRequired(true)
            )
        )    
        .addSubcommand(o=>
            o.setName('list')
            .setDescription('Get the list of licenses on the server')
            .addStringOption(o=>
                o.setName('name')
                .setDescription('Enter the name of the client')
                .setRequired(false)
            )
            .addStringOption(o=>
                o.setName('id')
                .setDescription('Enter the discord id of the client')
                .setRequired(false)
            )
            .addMentionableOption(o=>
                o.setName('tag')
                .setDescription('Enter the discord tag of the client')
                .setRequired(false)
            )
        )
        .addSubcommand(o=>
            o.setName('info')
            .setDescription('Get info for a specific license')
            .addStringOption(o=>
                o.setName('license')
                .setDescription('Enter the name of the license')
                .setRequired(true)
            )
        )
        .addSubcommand(o=>
            o.setName('cleardata')
            .setDescription('Clear data for a specific license')
            .addStringOption(o=>
                o.setName('license')
                .setDescription('Enter the name of the license')
                .setRequired(true)
            )
        )
        .addSubcommand(o=>
            o.setName('edit')
            .setDescription('Edit a specific license')
            .addStringOption(o=>
                o.setName('license')
                .setDescription('Enter the name of the license')
                .setRequired(true)
            )
        ),

    async run(client, interaction) {
        if (interaction.options.getSubcommand() === 'create') {
            const products = await productModel.find()
            if (!products || products.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('No products found').setColor('RED')
                    .setDescription('This server dont have any product to license\nyou can create products with /product')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})
            let iname = products.map((product, a)=>`${a+1}: ${product.name} [${product.price === 0 ? 'FREE' : `$${product.price}`}]`)
            let product = '';
            await interaction.reply({
                embeds: [ new MessageEmbed()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL()
                }).setTitle('Create license process').setColor('YELLOW')
                .setDescription('You started a license creation process, you have 2 minutes to finish the license creation process, answer my questions')
                .addField('**» Question [1/5]**', 'To what product should this license key to be binded to? you need to give me a valida product name...')
                .addField('**» Your products**', '```yaml\n'+iname.join('\n')+'```')
                .addField('**» Attention**', 'You can cancel this license creation process any time, type cancel in discord channel to cancell the process, license creation will automatically cancell after 2 minutes from start')
                .setFooter({
                    text: config.name,
                    iconURL: config.bot.icon
                })
                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                .setTimestamp()]
            , components: await functions.countButtons(products, 'product', 'secondary'), ephemeral: true}).then(async()=>{
                const message = await interaction.fetchReply()
                const collector = message.createMessageComponentCollector({
                    filter: (m)=>m.user.id === interaction.member.id,
                    componentType: 'BUTTON',
                    time: 600000,
                })
                collector.on('collect', async(i)=>{
                    await i.deferUpdate()
                    productid = i.customId
                    collector.stop()
                    const fetchMessage = await interaction.fetchReply()
                    const product = products.find((p)=> p.name.toLowerCase() == productid.toLowerCase())
                
                    if (!product) return interaction.editReply({
                        embeds: [ fetchMessage.embeds[0]
                        .setTitle('Invalid product name').setColor('RED').setImage('https://i.ibb.co/QjxPpsZ/Red.png').setFields([]).setDescription('You entered a invalid product name, try again')], components: []
                    })
                    const licensekey = functions.generateLicense()
                    const clientname = (await functions.ask({
                        embeds: [new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Create license process').setColor('YELLOW')
                            .addField('**» Question [2/5]**', 'What is the name of the client who is using this license?')
                            .addField('**» Progress**', '```yaml\n'+`Product: ${product.name}`+'```')
                            .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                            .addField('**» Attention**', 'You can cancel this license creation process any time, type cancel in discord channel to cancell the process, license creation will automatically cancell after 2 minutes from start')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                    , components: []}, interaction, false)).content
                    const fm2 = await interaction.fetchReply()
                    if (clientname.lenght < 3 || clientname.lenght > 15) return interaction.editReply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Invalid client name').setColor('RED')
                            .setDescription('The client name must be 3-15 characters long!')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                            .setTimestamp()]
                    })
                    if (functions.cancelask(fm2, clientname, interaction)) return
                    const discordclient = (await functions.ask({
                        embeds: [ new MessageEmbed() 
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Create license process').setColor('YELLOW')
                            .addField('**» Question [3/5]**', 'Does this client have a discord account? mention/discord id')
                            .addField('**» Progress**', '```yaml\n'+`Product: ${product.name}\nClient name: ${clientname}`+'```')
                            .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                            .addField('**» Attention**', 'You can cancel this license creation process any time, type cancel in discord channel to cancell the process, license creation will automatically cancell after 2 minutes from start')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                        }, interaction, false))
                    const fm3 = await interaction.fetchReply()
                    if (functions.cancelask(fm3, discordclient, interaction)) return
                    const discordid = discordclient.mentions.users.first() || client.users.cache.get(discordclient.content)
                    if (!discordid) return interaction.editReply({
                        embeds: [ fetchMessage.embeds[0]
                        .setTitle('Invalid Discord ID').setColor('RED').setImage('https://i.ibb.co/QjxPpsZ/Red.png').setFields([]).setDescription('You entered a invalid discord id or tag, try again')]
                    })
                    const ipcap = (await functions.ask({
                        embeds: [ new MessageEmbed() 
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Create license process').setColor('YELLOW')
                            .addField('**» Question [4/5]**', 'Set max ips cap for this licens (number/none)')
                            .addField('**» Progress**', '```yaml\n'+`Product: ${product.name}\nClient name: ${clientname}\nDiscord id: ${discordid.id}`+'```')
                            .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                            .addField('**» Attention**', 'You can cancel this license creation process any time, type cancel in discord channel to cancell the process, license creation will automatically cancell after 2 minutes from start')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                    }, interaction, false)).content
                    let ipmax
                    const fm4 = await interaction.fetchReply()
                    if (functions.cancelask(fm4, ipcap, interaction)) return
                    if (ipcap.toLowerCase() == 'none' || !parseInt(ipcap)) ipmax = 0
                    else ipmax = parseInt(ipcap)
                    await interaction.editReply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Create license process').setColor('YELLOW')
                            .addField('**» Question [5/5]**', 'Do you want to create this license key? yes/no')
                            .addField('**» Progress**', '```yaml\n'+`Product: ${product.name}\nClient name: ${clientname}\nDiscord id: ${discordid.id}\nIp Max: ${ipmax}`+'```')
                            .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                            .addField('**» Attention**', 'You can cancel this license creation process any time, type cancel in discord channel to cancell the process, license creation will automatically cancell after 2 minutes from start')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                    , components: [
                        new MessageActionRow().addComponents(
                            new MessageButton()
                                .setEmoji('✅')
                                .setStyle('SECONDARY')
                                .setCustomId('yes'),
                            new MessageButton()
                                .setEmoji('❌')
                                .setStyle('SECONDARY')
                                .setCustomId('no')
                        )
                   ]}).then(async()=>{
                        const message = await interaction.fetchReply()
                        const collector = message.createMessageComponentCollector({
                            filter: (mi)=>mi.user.id === interaction.member.id,
                            componentType: 'BUTTON',
                            time: 600000,
                        })
                        collector.on('collect', async(i)=>{
                            await i.deferUpdate()
                            if (i.customId === 'yes') {
                                await interaction.editReply({
                                    embeds: [ new MessageEmbed()
                                        .setAuthor({
                                            name: interaction.user.tag,
                                            iconURL: interaction.user.avatarURL()
                                        }).setTitle('A license is being created').setColor('ORANGE')
                                        .addField('**» Progress**', '```yaml\n'+`Product: ${product.name}\nClient name: ${clientname}\nDiscord id: ${discordid.id}\nIp Max: ${ipmax}`+'```')
                                        .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                                        .setFooter({
                                            text: config.name,
                                            iconURL: config.bot.icon
                                        })
                                        .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                        .setTimestamp()]
                                , components: []})
                                const newlicense = new licenseModel({
                                    product: product.name,
                                    licensekey: licensekey,
                                    clientname: clientname,
                                    discordid: discordid.id,
                                    discordname: discordid.username,
                                    discordtag: discordid.tag,
                                    ipcap: ipmax,
                                    createdby: interaction.user.tag,
                                    createdat: Date.now()
                                })
                                await newlicense.save()
                                await product.updateOne({
                                    purchases: product.purchases+=1
                                })
                                await product.save()
                                interaction.editReply({
                                    embeds: [ new MessageEmbed()
                                        .setAuthor({
                                            name: interaction.user.tag,
                                            iconURL: interaction.user.avatarURL()
                                        }).setTitle('A license was created').setColor('GREEN')
                                        .addField('**» License Information**', '```yaml\n'+`Product: ${product.name}\nClient name: ${clientname}\nDiscord id: ${discordid.id}\nIp Max: ${ipmax}`+'```')
                                        .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                                        .addField('**» Created by**', interaction.user.tag)
                                        .setFooter({
                                            text: config.name,
                                            iconURL: config.bot.icon
                                        })
                                        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                        .setTimestamp()]
                                })
                            } else {
                                interaction.editReply({
                                    embeds: [ new MessageEmbed()
                                        .setAuthor({
                                            name: interaction.user.tag,
                                            iconURL: interaction.user.avatarURL()
                                        }).setTitle('Creation license cancelled').setColor('RED')
                                        .addField('**» Progress**', '```yaml\n'+`Product: ${product.name}\nClient name: ${clientname}\nDiscord id: ${discordid.id}\nIp Max: ${ipmax}`+'```')
                                        .addField('**» License Key**', '```yaml\n' + licensekey + '```')
                                        .setFooter({
                                            text: config.name,
                                            iconURL: config.bot.icon
                                        })
                                        .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                                        .setTimestamp()]
                                , ephemeral: true})
                            }
                        })
                    })  
                })
                collector.on('end', async()=>{
                    await interaction.editReply({
                        components: []
                    })
                })
            })
        }
        if (interaction.options.getSubcommand() === 'delete') {
            let licenseString = interaction.options.getString('license')
            const license = await licenseModel.findOne({licensekey:{ $regex : new RegExp(licenseString, "i") }})
            if (!license || license.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid License').setColor('RED')
                    .setDescription('The entered license dosnt exists, check the license list with /license list, if you need your own licenses please use /self licenses')
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
                    }).setTitle('Delete a license?').setColor('ORANGE')
                    .setDescription('Are you sure to do this? if you delete the license you cant revert the action... yes/no')
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
                        await license.deleteOne()
                        return interaction.editReply({
                            embeds: [ new MessageEmbed()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('License Removed').setColor('GREEN')
                                .setDescription('The license was sussesfuly removed, you can check the license list with /license list or create one with /license create')
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
                                .setDescription('The remove license process was canceled, the license wasnt deleted')
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
        if (interaction.options.getSubcommand() === 'list') {
            const name = interaction.options.getString('name')
            const id = interaction.options.getString('id')
            const tag = interaction.options.getMentionable('tag')

            let licenses
            let user

            if (name) {
                licenses = await licenseModel.find({clientname:{ $regex : new RegExp(name, "i") }})
                user = name
            }
            else if (id) {
                licenses = await licenseModel.find({discordid:{ $regex : new RegExp(id, "i") }})
                user = `<@${id}>`
            }
            else if (tag) {
                licenses = await licenseModel.find({
                    discordtag: tag.user.tag
                })
                user = `<@${tag.user.id}>`
            }
            else {
                licenses = await licenseModel.find({})
                user = `all`
            }
            if (!licenses || licenses.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('No licenses found').setColor('RED')
                    .setDescription('I dont found existing licenses')
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
                        .setDescription(`Here is the ${user} licenses, if to see the licenses information use /self license\n\n**Total Licenses:** ${licenses.length}\n\n`)
                        .addField(`${licenses[i].product} License #${i+1}`, '```yaml\n'+`License: ${licenses[i].licensekey}\nIP Useds: ${licenses[i].iplist.length+'/'+licenses[i].ipcap}\nClient Name: ${licenses[i].clientname}\nClient Account: ${licenses[i].discordtag}`+'```')
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
            const license = await licenseModel.findOne({licensekey:{ $regex : new RegExp(licenseString, "i") }})
            if (!license || license.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid License').setColor('RED')
                    .setDescription('I dont found a existing license, you can create one with /license create')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})

            const iplist = license.iplist.map((data, i) => {
                return `${i + 1}: ${data.ip}`;
            });
            if (iplist.length == 0) iplist.push("1: None");
            return interaction.reply({
                embeds: [ new MessageEmbed()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL()
                })
                .setTitle('License Information').setColor('GREEN')
                .addField('**License key**', '```yaml\n' + license.licensekey + '```')
                .addField('**Client name**', license.clientname, true)
                .addField('**Discord id**', license.discordid, true)
                .addField('**Discord username**', license.discordname, true)
                .addField('**Discord tag**', license.discordtag, true)
                .addField('**Product**', license.product, true)
                .addField('**Created by**', license.createdby ? license.createdby : 'None', true)
                .addField('**Total IP**', `${license.iplist.length}/${license.ipcap}`, true)
                .addField('**Latest IP**', license.lastip ? license.lastip : 'None', true)
                .addField('**Created at**', `<t:${(license.createdat / 1000 | 0)}:f>`, true)
                .addField('**IP List**', '```yaml\n'+ iplist.join('\n').toString() +'```', false)
                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                .setFooter({
                    text: config.name,
                    iconURL: config.bot.icon
                }).setTimestamp()]
                , ephemeral: true})
        }
        if (interaction.options.getSubcommand() === 'cleardata') {
            let licenseString = interaction.options.getString('license')
            const license = await licenseModel.findOne({licensekey:{ $regex : new RegExp(licenseString, "i") }})
            if (!license || license.length == 0) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid License').setColor('RED')
                    .setDescription('I dont found a existing license, you can create one with /license create')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})
            await license.updateOne({
                iplist: []
            })
            await license.save()
            return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Cleared Data').setColor('GREEN')
                    .setDescription(`I sussesfuly cleared your IP list and data for the license, the product of the license are ${license.product}. For more info you can use /self info`)
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                    .setTimestamp()]
            , ephemeral: true})
        }
        if (interaction.options.getSubcommand() === 'edit') {
            const licenseString = interaction.options.getString('license')
            const license = await licenseModel.findOne({licensekey:{ $regex : new RegExp(licenseString, "i") }})
            if (!license) return interaction.reply({
                embeds: [ new MessageEmbed()
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL()
                    }).setTitle('Invalid License').setColor('RED')
                    .setDescription('I dont found a existing license, you can create one with /license create')
                    .setFooter({
                        text: config.name,
                        iconURL: config.bot.icon
                    })
                    .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                    .setTimestamp()]
            , ephemeral: true})
            const rowedit = new MessageActionRow().addComponents(
                new MessageButton()
                    .setLabel('Client Name')
                    .setCustomId('clientname')
                    .setStyle('SUCCESS')
                    .setEmoji('👤'),
                new MessageButton()
                    .setLabel('Client Account')
                    .setCustomId('discordid')
                    .setStyle('SUCCESS')
                    .setEmoji('🆔'),
                new MessageButton()
                    .setLabel('Product')
                    .setCustomId('product')
                    .setStyle('SUCCESS')
                    .setEmoji('🛒'),
                new MessageButton()
                    .setLabel('IP Max')
                    .setCustomId('ipmax')
                    .setStyle('SUCCESS')
                    .setEmoji('📡'),
            )
            const iplist = license.iplist.map((data, i) => {
                return `${i + 1}: ${data.ip}`;
            });
            if (iplist.length == 0) iplist.push('1: None');
            await interaction.reply({
                embeds: [ new MessageEmbed()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setTitle('License Information').setColor('GREEN')
                        .addField('**License key**', '```yaml\n' + license.licensekey + '```')
                        .addField('**Client name**', license.clientname, true)
                        .addField('**Discord id**', license.discordid, true)
                        .addField('**Discord username**', license.discordname, true)
                        .addField('**Discord tag**', license.discordtag, true)
                        .addField('**Product**', license.product, true)
                        .addField('**Created by**', license.createdby ? license.createdby : 'none', true)
                        .addField('**Total IP**', `${license.iplist.length}/${license.ipcap}`, true)
                        .addField('**Latest IP**', license.lastip ? license.lastip : 'None', true)
                        .addField('**Created at**', `<t:${(license.createdat / 1000 | 0)}:f>`, true)
                        .addField('**IP List**', '```yaml\n'+ iplist.join('\n').toString() +'```', false)
                        .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                        .setFooter({
                            text: config.name,
                            iconURL: config.bot.icon
                        }).setTimestamp()],
                components: [rowedit],
                ephemeral: true
            })
            const msg = await interaction.fetchReply()
            const collector = msg.createMessageComponentCollector({
                filter: (i)=>i.user.id === interaction.user.id && i.customId, time: ms('1m'), max: 1
            })
            collector.on('collect', async(i)=>{
                await i.deferUpdate()
                if (i.customId == 'clientname') {
                    const clientname = (await functions.ask({
                        embeds: [new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Edit License (Client name)').setColor('YELLOW')
                            .setDescription('Set the new value for the client name typing in this channel, client name must be 3-15 characters long! you can cancel typing cancel in the channel')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                    , components: []}, interaction, false)).content
                    const fm = await interaction.fetchReply()
                    if (functions.cancelask(fm, clientname, interaction)) return
                    if (clientname.lenght < 3 || clientname.lenght > 15) return interaction.editReply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Invalid client name').setColor('RED')
                            .setDescription('The client name must be 3-15 characters long!')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                            .setTimestamp()]
                    })
                    await license.updateOne({
                        clientname: clientname
                    })
                    await license.save()
                    await interaction.fetchReply()
                    interaction.editReply({
                        embeds: [ new MessageEmbed() 
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('License Edited (Client name)').setColor('GREEN')
                            .setDescription(`I sussesfuly changued the license client name !`)
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                            .setTimestamp()]
                    })
                }
                if (i.customId == 'discordid') {
                    const discordclient = (await functions.ask({
                        embeds: [new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Edit License (Client Account)').setColor('YELLOW')
                            .setDescription('Set the new value of discord id, or mention the discord user to set a new account. You can cancel the process typing cancel in the channel')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                    , components: []}, interaction, false))
                    const fm = await interaction.fetchReply()
                    if (functions.cancelask(fm, discordclient, interaction)) return
                    const discordid = discordclient.mentions.users.first() || client.users.cache.get(discordclient.content)
                    if (!discordid) return interaction.editReply({
                        embeds: [ fm.embeds[0]
                        .setTitle('Invalid Discord ID').setColor('RED').setImage('https://i.ibb.co/QjxPpsZ/Red.png').setFields([]).setDescription('You entered a invalid discord id or tag, try again')]
                    })
                    await license.updateOne({
                        discordid: discordid,
                        discordname: discordid.name,
                        discordtag: discordid.tag
                    })
                    await license.save()
                    await interaction.fetchReply()
                    interaction.editReply({
                        embeds: [ new MessageEmbed() 
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('License Edited (Client Account)').setColor('GREEN')
                            .setDescription(`I sussesfuly changued the discord client account !`)
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                            .setTimestamp()]
                    })
                }
                if (i.customId == 'product') {
                    const products = await productModel.find()
                    if (!products || products.length == 0) return interaction.editReply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('No products found').setColor('RED')
                            .setDescription('This server dont have any product to license\nyou can create products with /product')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
                            .setTimestamp()]
                    , ephemeral: true})
                    let iname = products.map((product, a)=>`${a+1}: ${product.name} [${product.price === 0 ? 'FREE' : `$${product.price}`}]`)
                    let product = '';
                    interaction.editReply({
                        embeds: [ new MessageEmbed()
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL()
                            }).setTitle('Edit License (Product Name)').setColor('YELLOW')
                            .setDescription('Set the new value of product name, select the correct button:)')
                            .addField('**» Your products**', '```yaml\n'+iname.join('\n')+'```')
                            .setFooter({
                                text: config.name,
                                iconURL: config.bot.icon
                            })
                            .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                            .setTimestamp()]
                            , components: await functions.countButtons(products, 'product', 'secondary'), ephemeral: true}).then(async()=>{
                                const message = await interaction.fetchReply()
                                const collector = message.createMessageComponentCollector({
                                    filter: (m)=>m.user.id === interaction.member.id,
                                    componentType: 'BUTTON',
                                })
                                collector.on('collect', async(i)=>{
                                    await i.deferUpdate()
                                    productid = i.customId
                                    collector.stop()
                                    const fetchMessage = await interaction.fetchReply()
                
                                    const product = products.find((p)=> p.name.toLowerCase() == productid.toLowerCase())
                                    const productlic = products.find((p)=> p.name.toLowerCase() == license.product.toLowerCase())

                                    if (!product || !productlic) return interaction.editReply({
                                        embeds: [ fetchMessage.embeds[0]
                                        .setTitle('Invalid product name').setColor('RED').setImage('https://i.ibb.co/QjxPpsZ/Red.png').setFields([]).setDescription('You entered a invalid product name, try again')] , components: []
                                    })
                                    productlic.updateOne({
                                        purchases: productlic.purchases=-1
                                    })
                                    await productlic.save()
                                    product.updateOne({
                                        purchases: product.purchases=+1
                                    })
                                    await product.save()
                                    await license.updateOne({
                                        product: product.name
                                    })
                                    await license.save()
                                    await interaction.fetchReply()
                                    interaction.editReply({
                                        embeds: [ new MessageEmbed() 
                                            .setAuthor({
                                                name: interaction.user.tag,
                                                iconURL: interaction.user.avatarURL()
                                            }).setTitle('License Edited (Product Name)').setColor('GREEN')
                                            .setDescription(`I sussesfuly changued the product name !`)
                                            .setFooter({
                                                text: config.name,
                                                iconURL: config.bot.icon
                                            })
                                            .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                            .setTimestamp()]
                                        , components: []})
                                }
                            )
                        })
                    }
                    if (i.customId == 'ipmax') {
                        const ipcap = (await functions.ask({
                            embeds: [ new MessageEmbed() 
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('Edit License (IP Max)').setColor('YELLOW')
                                .setDescription('Set the new value of ipmax, type a int you can type cancel to exit')
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/0BGRx2p/Yellow.png`)
                                .setTimestamp()]
                                , components: []}, interaction, false)).content
                        let ipmax
                        const fm = await interaction.fetchReply()
                        if (functions.cancelask(fm, ipcap, interaction)) return
                        if (ipcap.toLowerCase() == 'none' || !parseInt(ipcap)) ipmax = 0
                        else ipmax = parseInt(ipcap)
                        await license.updateOne({
                            ipcap: ipmax
                        })
                        await license.save()
                        interaction.editReply({
                            embeds: [ new MessageEmbed() 
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL: interaction.user.avatarURL()
                                }).setTitle('License Edited (IP Max)').setColor('GREEN')
                                .setDescription(`I sussesfuly changued the IP Max !`)
                                .setFooter({
                                    text: config.name,
                                    iconURL: config.bot.icon
                                })
                                .setImage(`https://i.ibb.co/GFx981b/Green.png`)
                                .setTimestamp()]
                        })
                    }
                }
            )
        }
    }
}