exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis, supervisorsRole, noPrivilegesEmbed) => {
    
    //-md (@usuario) (autor | anonimo) (mensaje a enviar)
    
    try {
        
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let noMentionEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(emojis.RedTick + ' No has mencionado un usuario válido');
        
        let noTypeAndToDMEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(emojis.RedTick + ' No has proporcionado ni el tipo de mensaje ni contenido del mensaje');
        
        let noToDMEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(emojis.RedTick + ' No has proporcionado el contenido del mensaje');
        
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(emojis.RedTick + ' La sintaxis de este comando es `' + config.ownerPrefix + 'md (@usuario) (autor/anonimo) (mensaje a enviar)`');
        
        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF04647)
            .setDescription(emojis.RedTick + ' No puedes entablar una conversación con un bot');
        
        let noPrivilegesEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' ' + message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando');
        
        let confirmEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription(emojis.GreenTick + ' ¡Mensaje enviado!');
        
        if (!args[1]) return message.channel.send(noTypeAndToDMEmbed);
        if (!args[2]) return message.channel.send(noToDMEmbed);
        
        let user = message.mentions.users.first();
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let toDM = message.content.slice(toDeleteCount)
        
        if (!user) return message.channel.send(noMentionEmbed);
        if (user.bot) return message.channel.send(noBotsEmbed);
        if (!args[0].startsWith('<@')) return message.channel.send(noCorrectSyntaxEmbed);
        
        let resultEmbed = 'null';
        let privilegesCheck = 'true';
        
        switch (args[1]) {
            case 'autor':
                resultEmbed = new discord.RichEmbed()
                    .setAuthor('Mensaje de: ' + message.author.username, message.author.avatarURL)
                    .setColor(0xFFC857)
                    .setDescription(toDM);
                break;
            case 'anonimo':
                const supervisorsRole = message.guild.roles.get(config.botSupervisor);
                if (message.author.id !== config.botOwner || message.member.roles.has(supervisorsRole.id)) {
                    privilegesCheck = 'false';
                }
                resultEmbed = new discord.RichEmbed()
                    .setColor(0xFFC857)
                    .setDescription(toDM);
                break;
            default:
                return message.channel.send(noCorrectSyntaxEmbed);
                break;
        }

        if (privilegesCheck === 'true') {
            message.delete()
            await user.send(resultEmbed);
            await message.channel.send(confirmEmbed);
        } else {
            message.channel.send(noPrivilegesEmbed);
        }
        
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
