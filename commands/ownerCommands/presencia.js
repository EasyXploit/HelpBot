exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed);
    return;
        
    function changePresence() {
        let presence = 'dev status';
        let ifError = false;
        let errorCount = 0;

        try {
            if (args[0] === 'estado') {
                if (args[1] === 'online' || args[1] === 'offline' || args[1] === 'idk') {
                    bot.user.setStatus(args[1])
                } else {
                    let errorEmbed = new discord.RichEmbed()
                        .setColor(0xF12F49)
                        .setDescription('❌ Debes especificar el tipo de estado a modificar');
                    message.channel.send(errorEmbed);
                }
            } else if (args[0] === 'juego') {
                bot.user.setGame(args[1])
            } else {
                let embed = new discord.RichEmbed()
                    .setColor(0xF12F49)
                    .setDescription('❌ Debes especificar el tipo de presencia a modificar');
                message.channel.send(errorEmbed);
            }
        } catch (e) {
            ifError = true
            errorCount = errorCount + 1
            console.error(new Date().toUTCString() + " 》" + e)

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .addField('❌ Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
        } try {
            if ( ifError = true) {
                let embed = new discord.RichEmbed()
                    .setColor(0xB8E986)
                    .setTitle('✅ Operación completada')
                    .setDescription('Cambiaste el estado del bot a ' + presence)
                message.channel.send({embed})

                embed = new discord.RichEmbed()
                    .setColor(0x4A90E2)
                    .setTimestamp()
                    .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                    .setTitle('📑 Auditoría')
                    .setDescription(message.author.username + ' cambió el estado del bot a ' + presence);
                loggingChannel.send({embed})
            } else {
                return
            }
        } catch (e) {
            ifError = true
            errorCount = errorCount + 1
            console.error(new Date().toUTCString() + " 》" + e)

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .addField('❌ Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
        }
    }
    changePresence()
}
