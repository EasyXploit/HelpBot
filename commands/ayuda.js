exports.run = async (discord, fs, client, message, args, command) => {
    
    //!ayuda
    
    try {
        let helpEmbed = new discord.MessageEmbed()
        .setColor(client.colors.gold)
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Sistema de ayuda del servidor')
        .setThumbnail('http://i.imgur.com/sYyH2IM.png')
        .addField(`📓 ${client.config.prefixes.mainPrefix}normas`, 'Muestra las normas del servidor.')
        .addField(`⚙ ${client.config.prefixes.mainPrefix}comandos`, 'Muestra los comandos de <@446041159853408257>.')
        .addField(`🤖 ${client.config.prefixes.mainPrefix}bots`, 'Muestra los comandos de los bots.')
        .addField(`🎖 ${client.config.prefixes.mainPrefix}rangos`, 'Muestra los rangos del servidor, la tabla de puntuaciones y tu nivel.')
        .addField(`ℹ ${client.config.prefixes.mainPrefix}info`, 'Muestra información acerca del proyecto.')
        .addField(`🥇 ${client.config.prefixes.mainPrefix}rank`, 'Muestra tu rango actual.')
        .addField(`🏆 ${client.config.prefixes.mainPrefix}leaderboard [pág.]`, 'Muestra la tabla de clasificación.');

    await message.channel.send(helpEmbed).then(async function (msg) {
        
        await msg.react('📓');
        await msg.react('⚙');
        await msg.react('🤖');
        await msg.react('🎖');
        await msg.react('ℹ');
        await msg.react('🥇');
        await msg.react('🏆');

        const filter = (reaction, user) => {
            return ['📓', '⚙', '🤖', '🎖', 'ℹ', '🥇', '🏆'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '📓') {
                    await msg.delete()
                    require(`../commands/normas.js`).run(discord, fs, client, message, args, command);
                    
                } else if (reaction.emoji.name === '⚙') {
                    await msg.delete()
                    require(`./comandos.js`).run(discord, fs, client, message, args, command);
                    
                }  else if (reaction.emoji.name === '🤖') {
                    await msg.delete()
                    client.valueCheck = message.author.id;
                    require(`./bots.js`).run(discord, fs, client, message, args, command);
                    
                } else if (reaction.emoji.name === '🎖') {
                    await msg.delete()
                    require(`../commands/rangos.js`).run(discord, fs, client, message, args, command);
                    
                } else if (reaction.emoji.name === 'ℹ') {
                    await msg.delete()
                    require(`../commands/info.js`).run(discord, fs, client, message, args, command);
                    
                } else if (reaction.emoji.name === '🥇') {
                    await msg.delete()
                    require(`../commands/rank.js`).run(discord, fs, client, message, args, command);
                    
                } else if (reaction.emoji.name === '🏆') {
                    await msg.delete()
                    require(`../commands/leaderboard.js`).run(discord, fs, client, message, args, command);
                };
            })
            .catch(() => {
                return;
            });
        });
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
};
