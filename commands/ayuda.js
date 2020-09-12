exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!ayuda
    
    try {
        const userID = message.author.id;
        
        let helpEmbed = new discord.MessageEmbed()
        .setColor(resources.gold)
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Sistema de ayuda del servidor')
        .setThumbnail('http://i.imgur.com/sYyH2IM.png')
        .addField(`📓 ${config.prefix}normas`, 'Muestra las normas del servidor.')
        .addField(`${resources.pilkobot} ${config.prefix}pilko`, 'Muestra los comandos de <@446041159853408257> ')
        .addField(`:robot: ${config.prefix}comandos`, 'Muestra los comandos de los bots.')
        .addField(`🎖 ${config.prefix}rangos`, 'Muestra los rangos del servidor, la tabla de puntuaciones y tu nivel.')
        .addField(`ℹ ${config.prefix}info`, 'Muestra información acerca del proyecto')
        .addField(`🥇 ${config.prefix}rank`, 'Muestra tu rango actual')
        .addField(`🏆 ${config.prefix}leaderboard [pág.]`, 'Muestra la tabla de clasificación')
        .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL());

    await message.channel.send(helpEmbed).then(async function (msg) {
        
        await msg.react('📓');
        await msg.react(resources.pilkobot);
        await msg.react('🤖');
        await msg.react('🎖');
        await msg.react('ℹ');
        await msg.react('🥇');
        await msg.react('🏆');

        const filter = (reaction, user) => {
            return ['📓', 'pilkobot', '🤖', '🎖', 'ℹ', '🥇', '🏆'].includes(reaction.emoji.name) && user.id === userID;
        };

        msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '📓') {
                    await msg.delete()
                    require(`../commands/normas.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === 'pilkobot') {
                    await msg.delete()
                    require(`../commands/pilko.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                }  else if (reaction.emoji.name === '🤖') {
                    await msg.delete()
                    resources.valueCheck = userID;
                    require(`../commands/comandos.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === '🎖') {
                    await msg.delete()
                    require(`../commands/rangos.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === 'ℹ') {
                    await msg.delete()
                    require(`../commands/info.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === '🥇') {
                    await msg.delete()
                    require(`../commands/rank.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                } else if (reaction.emoji.name === '🏆') {
                    await msg.delete()
                    require(`../commands/leaderboard.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                    
                }
            })
            .catch(collected => {
                return;
            });
        });
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
