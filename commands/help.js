exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!ayuda
    
    try {
        let helpEmbed = new discord.MessageEmbed()
        .setColor('FEB526')
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle(`Sistema de ayuda de ${client.user.username}`)
        .setThumbnail('http://i.imgur.com/sYyH2IM.png')
        .addField(`⚙ ${client.config.guild.prefix}comandos`, 'Muestra los comandos de <@446041159853408257>.')
        .addField(`ℹ ${client.config.guild.prefix}info`, 'Muestra información acerca del proyecto.')
        .addField(`🥇 ${client.config.guild.prefix}rank`, 'Muestra tu rango actual.')
        .addField(`🏆 ${client.config.guild.prefix}leaderboard [pág.]`, 'Muestra la tabla de clasificación.');

    await message.channel.send(helpEmbed).then(async function (msg) {
        
        await msg.react('⚙');
        await msg.react('ℹ');
        await msg.react('🥇');
        await msg.react('🏆');

        const filter = (reaction, user) => {
            return ['⚙', '🤖', '🥇', '🏆'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '⚙') {
                    await msg.delete()
                    require(`./comandos.js`).run(discord, client, message, args, command, commandConfig);
                    
                } else if (reaction.emoji.name === 'ℹ') {
                    await msg.delete()
                    require(`../commands/info.js`).run(discord, client, message, args, command, commandConfig);
                    
                } else if (reaction.emoji.name === '🥇') {
                    await msg.delete()
                    require(`../commands/rank.js`).run(discord, client, message, args, command, commandConfig);
                    
                } else if (reaction.emoji.name === '🏆') {
                    await msg.delete()
                    require(`../commands/leaderboard.js`).run(discord, client, message, args, command, commandConfig);
                };
            })
            .catch(() => {
                return;
            });
        });
    } catch (error) {
        console.error(error);
    };
};
