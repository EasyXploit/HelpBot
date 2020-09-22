exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!comandos
    
    try {
        
        let helpEmbed = new discord.MessageEmbed()
            .setColor(16762967)
            .setThumbnail('http://i.imgur.com/g31RYSS.png')
            .setAuthor('COMANDOS', 'http://i.imgur.com/E3nPnZY.png')
            .setTitle('Comandos de los bots del servidor')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL())
            .addField(`${resources.pilkobot} ${config.prefix}pilko`, 'Muestra los comandos de <@446041159853408257> ')
            .addField(`⚡ ${config.prefix}salas`, 'Muestra la ayuda para crear salas de voz.')
            .addField(`🎵 ${config.prefix}musica`, 'Muestra la ayuda para reproducir música en las salas de voz.')
            .addField(`🎶 ${config.prefix}dj`, `Muestra los comandos para controlar la música (solo DJs) ${resources.beta}.`)
            .addField(`${resources.boxbot} ${config.prefix}boxbot`, 'Muestra la ayuda para jugar a <@413728456942288896> en <#433376010688397312>');
        
        let originUser = resources.valueCheck;
        resources.valueCheck = 'null';
            
        if (originUser === 'null') {
            originUser = message.author.id;
        }
            
        await message.channel.send(helpEmbed).then(async function (msg) {
            
            await msg.react(resources.pilkobot);
            await msg.react('⚡');
            await msg.react('🎵');
            await msg.react('🎶');
            await msg.react('🎭');
            await msg.react(resources.boxbot);

            const filter = (reaction, user) => {
                return ['pilkobot', '⚡', '🎵', '🎶', '🎭', 'boxbot'].includes(reaction.emoji.name) && user.id === originUser;
            };

            msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === 'pilkobot') {
                    await msg.delete()
                    require(`../commands/pilko.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                } else if (reaction.emoji.name === '⚡') {
                    await msg.delete()
                    require(`../commands/salas.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                } else if (reaction.emoji.name === '🎵') {
                    await msg.delete()
                    require(`../commands/musica.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                } else if (reaction.emoji.name === '🎶') {
                    await msg.delete()
                    require(`../commands/dj.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                } else if (reaction.emoji.name === '🎭') {
                    await msg.delete()
                    require(`../commands/memes.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                }   else if (reaction.emoji.name === 'boxbot') {
                    await msg.delete()
                    require(`../commands/boxbot.js`).run(discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources);
                } 
            }).catch(() => {
                return;
            });
        });
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
