exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!edit <ID del canal> <ID del mensaje> <nuevo contenido>
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}edit <ID del canal> <ID del mensaje> <nuevo contenido>\``);
        
        if (!args[0] || !args[1] || !args[2]) return message.channel.send(noCorrectSyntaxEmbed);
            
        const channel = message.guild.channels.cache.find(c => c.id === args[0]);
        if (!channel) return message.channel.send(noCorrectSyntaxEmbed);
        
        const msg = await channel.messages.fetch(args[1]);
        if (!msg) return message.channel.send(noCorrectSyntaxEmbed);

        const newContent = message.content.slice(command.length - 2 + args[0].length + 1 + args[0].length + 2);
        if (!newContent) return message.channel.send(noCorrectSyntaxEmbed);

        let newEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setDescription(newContent);
        
        msg.edit(newEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};