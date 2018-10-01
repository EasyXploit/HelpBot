exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    let m = message;
    message.channel.send ('Test').then(async function (message) {
        await message.react('❔');
        await message.react('🤖');
        await message.react('⏱');
        await message.react('ℹ');

        const filter = (reaction, user) => {
            return ['❔', '🤖', '⏱', 'ℹ'].includes(reaction.emoji.name) && user.id === m.author.id;
        };

        message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const reaction = collected.first();
                //console.log(m);

                if (reaction.emoji.name === '❔') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/normas.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis);
                    
                } else if (reaction.emoji.name === '🤖') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/comandos.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis);
                    
                } else if (reaction.emoji.name === '⏱') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/ping.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis);
                    
                } else if (reaction.emoji.name === 'ℹ') {
                    await message.delete()
                    
                    let commandFile = require(`../commands/info.js`).run(discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis);
                    
                }
            })
            .catch(collected => {
                return;
            });
    });
}