exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed);

    if (args.length > 0) {
        if (args.length < 3) {
            if (message.mentions.channels.first()) {
                let awaitingEmbed = new discord.RichEmbed()
                    .setTitle('👁 Registrando mensajes ...')
                    .setColor(0xFFC857)
                    .setDescription(bot.user.username + ' registrará todos los mensajes enviados a ' + args[0] + ' durante ' + args[1] + 'ms.')
                    .setFooter(bot.user.username, bot.user.avatarURL)
                    .setTimestamp();
                await message.channel.send(awaitingEmbed);

                console.log('\n 》' + bot.user.username + ' ha comenzado a registrar los mensajes del canal ' + message.mentions.channels.first().name + ' a petición de ' + message.author.username + ' durante ' + args[1] + 'ms.\n');

                const msgs = await message.mentions.channels.first().awaitMessages(msg => {
                    console.log(' - ' +  msg.author.username + ' > ' + msg.content);
                    return msg.content;
                }, {time: args[1]});

                let stopEmbed = new discord.RichEmbed()
                    .setTitle('👁 Registro finalizado')
                    .setColor(0xFFC857)
                    .setDescription('Mensajes registrados por ' + bot.user.username + `:\n\n- ${msgs.map(msg => msg.content).join('\n- ')}`)
                    .setFooter(bot.user.username, bot.user.avatarURL)
                    .setTimestamp();
                message.channel.send(stopEmbed);

                console.log('\n 》' + bot.user.username + ' finalizó el registro de mensajes.');

            } else {
                let errorEmbed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setTitle('❌ Ocurrió un error')
                    .setDescription(message.author.username + ', debes mencionar un canal de texto.');
                message.channel.send(errorEmbed);
            }
        } else {
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setTitle('❌ Ocurrió un error')
                .setDescription(message.author.username + ', tan solo debes proporcionar la duración del registro (en milisegundos) y mencionar un canal de texto.');
            message.channel.send(errorEmbed);
        }
    } else {
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .setDescription(message.author.username + ', debes proporcionar la duración del registro (en milisegundos).');
        message.channel.send(errorEmbed);
    }
}
