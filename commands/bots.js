exports.run = async (discord, fs, client, message, args, command) => {
    
    //!bots
    
    try {
        
        let helpEmbed = new discord.MessageEmbed()
            .setColor(16762967)
            .setThumbnail('http://i.imgur.com/g31RYSS.png')
            .setAuthor('COMANDOS DE BOTS', 'http://i.imgur.com/E3nPnZY.png')
            .setTitle('Comandos de los bots del servidor')
            .addField(`⚙ ${client.config.prefixes.mainPrefix}comandos`, 'Muestra los comandos de <@446041159853408257> ')
            .addField(`⚡ ${client.config.prefixes.mainPrefix}salas`, 'Muestra la ayuda para crear salas de voz.')
            .addField(`🎵 ${client.config.prefixes.mainPrefix}musica`, 'Muestra la ayuda para reproducir música en las salas de voz.')
            .addField(`${client.emotes.boxbot} ${client.config.prefixes.mainPrefix}boxbot`, 'Muestra la ayuda para jugar a <@413728456942288896> en <#433376010688397312>');
        
        let originUser = client.valueCheck;
        client.valueCheck = 'null';
            
        if (originUser === 'null') {
            originUser = message.author.id;
        }
            
        await message.channel.send(helpEmbed).then(async function (msg) {
            
            await msg.react('⚙');
            await msg.react('⚡');
            await msg.react('🎵');
            await msg.react(client.emotes.boxbot);

            const filter = (reaction, user) => {
                return ['⚙', '⚡', '🎵', 'boxBot'].includes(reaction.emoji.name) && user.id === originUser;
            };

            msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '⚙') {
                    await msg.delete()
                    require(`./comandos.js`).run(discord, fs, client, message, args, command);
                } else if (reaction.emoji.name === '⚡') {
                    await msg.delete()
                    require(`../commands/salas.js`).run(discord, fs, client, message, args, command);
                } else if (reaction.emoji.name === '🎵') {
                    await msg.delete()
                    require(`../commands/musica.js`).run(discord, fs, client, message, args, command);
                } else if (reaction.emoji.name === 'boxBot') {
                    await msg.delete()
                    require(`../commands/boxbot.js`).run(discord, fs, client, message, args, command);
                };
            }).catch(() => {
                return;
            });
        });
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
;}
