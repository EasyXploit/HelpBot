exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //$nombre (nombre)

        try {
            let noCorrectSyntaxEmbed = new discord.RichEmbed()
                .setColor(0xF04647)
                .setDescription(emojis.RedTick + ' La sintaxis del comando es `' + config.ownerPrefix + 'nombre (nombre)`');
            
            //Comprueba si se ha proporcionado argumento
            if (args.length < 1) return message.channel.send(noCorrectSyntaxEmbed);
            
            //Se graba el nombre de usuario en una variable
            let nickname = args.join(' '); //Se graba el nuevo username
            
            let actuallyConfiguredEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(emojis.RedTick + ' Este nombre de usuario ya ha sido configurado');
            
            //Se comprueba si el nombre de usuario proporcionado es igual al ya configurado
            if (nickname === bot.user.username) return message.channel.send(actuallyConfiguredEmbed);
            
            console.log('\n' + new Date().toUTCString() + ' 》Se procederá a cambiar el nombre de usuario ' + bot.user.username + ' a ' + nickname);

            //Se cambia el username
            await bot.user.setUsername(nickname);
              
            let successEmbed = new discord.RichEmbed()
                .setColor(0xB8E986)
                .setTitle(emojis.GreenTick + ' Operación completada')
                .setDescription('Cambiaste el nombre del bot a ' + nickname);

            let loggingEmbed = new discord.RichEmbed()
                .setColor(0x4A90E2)
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL)
                .setTitle('📑 Auditoría')
                .setDescription(message.author.username + ' cambió el nombre del bot a ' + nickname);

            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);
        } catch (e) {
            const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
        }
}
