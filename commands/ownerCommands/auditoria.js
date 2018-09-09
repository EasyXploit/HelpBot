exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    if(args.length >= 1) {
        if (args.length <= 1) {
            if (message.mentions.channels.first()) {

                async function changeLoggingChannel() {
                    try {
                        let channelMention = args[0];
                        channelMention = channelMention.substring(2, channelMention.length - 1);
                        config.loggingChannel = channelMention;
                        await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);

                        let completedEmbed = new discord.RichEmbed()
                            .setColor(0xB8E986)
                            .setTitle('✅ Operación completada')
                            .setDescription('Cambiaste el canal de auditoría a ' + args[0]);
                        message.channel.send(completedEmbed);

                        let loggingEmbed = new discord.RichEmbed()
                            .setColor(0x4A90E2)
                            .setTimestamp()
                            .setFooter(bot.user.username, bot.user.avatarURL)
                            .setTitle('📑 Auditoría')
                            .setDescription(message.author.username + ' cambió el canal de auditoría a ' + args[0]);
                        loggingChannel.send(loggingEmbed);
                    } catch (e) {
                        console.error(new Date().toUTCString() + ' 》' + e);
                        let errorEmbed = new discord.RichEmbed()
                            .setColor(0xF12F49)
                            .setTitle('❌ Ocurrió un error')
                            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
                        message.channel.send(errorEmbed);
                    }
                }
                changeLoggingChannel();
            } else {
                console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó un canal de texto válido para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

                let errorEmbed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setDescription('❌ No has mencionado un canal de texto válido');
                message.channel.send(errorEmbed);
            }
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' proporcionó demasiados argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ Proporcionaste demasiados argumentos.\nTan solo debes mencionar un canal de texto');
            message.channel.send(errorEmbed);
        }
    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ Debes mencionar un canal de texto');
        message.channel.send(errorEmbed);
    }
}
