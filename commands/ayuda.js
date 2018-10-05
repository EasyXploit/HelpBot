exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!ayuda
    
    try {
        const userID = message.author.id;
        
        let helpEmbed = new discord.RichEmbed()
        .setColor(0xFFC857)
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Sistema de ayuda del servidor')
        .setThumbnail('http://i.imgur.com/sYyH2IM.png')
        .setFooter('© 2018 República Gamer LLC', resources.server.iconURL)

        .addField(':grey_question: ' + config.prefix + 'normas', 'Muestra las normas del servidor.', true)
        .addField(resources.pilkobot + ' ' + config.prefix + 'pilko', 'Muestra los comandos de <@446041159853408257> ', true)
        .addField(':robot: ' + config.prefix + 'comandos', 'Muestra los comandos de los bots.', true)
        .addField('🎖 ' + config.prefix + 'rangos', 'Muestra los rangos del servidor.', true)
        .addField(':label: !rank', 'Muestra tu rango en el servidor (o el de otro usuario).', true)
        .addField(':trophy: !levels', 'Muestra la tabla de clasificación del servidor.', true)
        .addField(':ticket: +invites', 'Muestra a cuentas personas has invitado.', true)
        .addField('📈 +leaderboard', 'Muestra la tabla de clasificación de invitaciones.', true)
        .addField(':stopwatch: ' + config.prefix + 'ping', 'Comprueba el tiempo de respuesta entre el cliente y ' + bot.user.username, true)
        .addField('ℹ ' + config.prefix + 'info', 'Muestra información acerca del proyecto', true);
        
    await message.channel.send(helpEmbed).then(async function (message) {
        
        const pilkobot = bot.emojis.get('496633714802032655')
        
        await message.react('❔');
        await message.react(pilkobot);
        await message.react('🤖');
        await message.react('🎖');
        await message.react('⏱');
        await message.react('ℹ');

        const filter = (reaction, user) => {
            return ['❔', 'pilkobot', '🤖', '🎖', '⏱', 'ℹ'].includes(reaction.emoji.name) && user.id === userID;
        };

        message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '❔') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/normas.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === 'pilkobot') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/pilko.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                }  else if (reaction.emoji.name === '🤖') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/comandos.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === '🎖') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/rangos.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                }  else if (reaction.emoji.name === '⏱') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/ping.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === 'ℹ') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/info.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                }
            })
            .catch(collected => {
                return;
            });
    });
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
