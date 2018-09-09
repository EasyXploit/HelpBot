exports.run = async (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);
    
    try {
        let noMentionEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription('❌ No has mencionado un usuario válido');
        
        let noTypeAndToDMEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription('❌ No has proporcionado ni el tipo de mensaje ni contenido del mensaje');
        
        let noToDMEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription('❌ No has proporcionado el contenido del mensaje');
        
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setTitle('❌ Ocurrió un error')
            .setDescription('La sintaxis del comando es `' + config.ownerPrefix + 'md (@usuario) (autor/anonimo) (mensaje a enviar)`');
        
        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription('❌ No puedes entablar una conversación con un bot');
        
        let noPrivilegesEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ ' + message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando');
        
        let confirmEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription('✅ ¡Mensaje enviado!');
        
        if (!args[1]) return message.channel.send(noTypeAndToDMEmbed);
        if (!args[2]) return message.channel.send(noToDMEmbed);
        
        let user = message.mentions.users.first();
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let toDM = message.content.slice(toDeleteCount)
        
        if (!user) return message.channel.send(noMentionEmbed);
        if (user.bot) return message.channel.send(noBotsEmbed);
        if (!args[0].startsWith('<@!')) return message.channel.send(noCorrectSyntaxEmbed);
        
        let resultEmbed = 'null';
        let privilegesCheck = true;
        
        switch (args[1]) {
            case 'autor':
                resultEmbed = new discord.RichEmbed()
                    .setAuthor('Mensaje de: ' + message.author.username, message.author.avatarURL)
                    .setColor(0xFFC857)
                    .setDescription(toDM);
                break;
            case 'anonimo':
                if (message.author.id !== config.botOwner) return privilegesCheck = false;
                resultEmbed = new discord.RichEmbed()
                    .setColor(0xFFC857)
                    .setDescription(toDM);
                break;
            default:
                return message.channel.send(noCorrectSyntaxEmbed);
                break;
        }
        
        try {
            if (privilegesCheck === false) {
                message.channel.send(noPrivilegesEmbed);
                return;
            }
            await user.send(resultEmbed);
            await message.channel.send(confirmEmbed);
        } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF04647)
                .setTitle('❌ Ocurrió un error')
                .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
        }
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
}
