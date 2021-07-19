exports.run = (discord, client, message, args, command) => {
    
    //!di (texto)
    
    try {   
        let noTextEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes escribir el contenido del mensaje`);

        if (!args[0]) return message.channel.send(noTextEmbed);
        
        message.delete();
        const text = message.content.slice(4);

        let resultEmbed = new discord.MessageEmbed()
            .setColor(0x2E4052)
            .setAuthor(`${message.author.tag} dijo:`, message.author.avatarURL())
            .setDescription(text);
        
        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}
