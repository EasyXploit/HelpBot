exports.run = async (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {
    
    try {
        let noMentionEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ No has mencionado un usuario válido');
        
        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ No puedes entablar una conversación con un bot');
        
        let confirmEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setDescription('✅ ¡Mensaje enviado!');
        
        let user = message.mentions.users.first();
        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let toDM = message.content.slice(toDeleteCount)
        
        if (!user) return message.channel.send(noMentionEmbed);
        if (user.bot) return message.channel.send(noBotsEmbed);
        
        let resultEmbed = new discord.RichEmbed()
            .setAuthor('Mensaje de: ' + message.author.username, message.author.avatarURL)
            .setColor(0xFFC857)
            .setDescription(toDM);
        
        try {
            await user.send(resultEmbed);
            await message.channel.send(confirmEmbed);
        } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setTitle('❌ Ocurrió un error')
                .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
            message.channel.send(errorEmbed);
        }
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
}
