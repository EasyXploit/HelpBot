exports.run = (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {

    async function changeNickname() {
        let nickname = bot.user.username;
        nickname = args.join(' ');

        try {
            console.log(new Date().toUTCString() + ' 》Se procederá a cambiar el  nombre de usuario ' + bot.user.username + ' a ' + nickname);

            await bot.user.setUsername(nickname);

            try {
                if(bot.user.username === nickname) {
                    let successEmbed = new discord.RichEmbed()
                        .setColor(0xB8E986)
                        .setTitle('✅ Operación completada')
                        .setDescription('Cambiaste el nombre del bot a ' + nickname);
                    message.channel.send(successEmbed);

                    let loggingEmbed = new discord.RichEmbed()
                        .setColor(0x4A90E2)
                        .setTimestamp()
                        .setFooter(bot.user.username, bot.user.avatarURL)
                        .setTitle('📑 Auditoría')
                        .setDescription(message.author.username + ' cambió el nombre del bot a ' + nickname);
                    loggingChannel.send(loggingEmbed);
                } else {
                    message.channel.send('Hubo un problema durante el cambio de nombre: `nickname` no es igual a `bot.user.username`');
                    return;
                }
            } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .addField('❌ Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
            }
        } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .addField('❌ Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
        }
    }
    changeNickname();
}
