exports.run = async (discord, client, message, args, command) => {
    
    //$edit <ID del canal> <ID del mensaje> <nuevo contenido>
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} La sintaxis de este comando es \`${client.config.prefixes.ownerPrefix}edit <ID del canal> <ID del mensaje> <nuevo contenido>\``);
        
        if (!args[0] || !args[1] || !args[2]) return message.channel.send(noCorrectSyntaxEmbed);
            
        const channel = message.guild.channels.cache.find(c => c.id === args[0]);
        if (!channel) return message.channel.send(noCorrectSyntaxEmbed);
        
        const msg = await channel.messages.fetch(args[1]);
        if (!msg) return message.channel.send(noCorrectSyntaxEmbed);

        const newContent = message.content.slice(command.length - 2 + args[0].length + 1 + args[0].length + 2);
        if (!newContent) return message.channel.send(noCorrectSyntaxEmbed);
        
        message.delete();

        let newEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setDescription(newContent);
        
        msg.edit(newEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
