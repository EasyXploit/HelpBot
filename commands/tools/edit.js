exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!edit <ID del canal> <ID del mensaje> <nuevo contenido>
    
    try {
        let incorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}edit <ID del canal> <ID del mensaje> <nuevo contenido>\``);
        
        if (!args[0] || !args[1] || !args[2]) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
            
        const channel = message.guild.channels.cache.find(c => c.id === args[0]);
        if (!channel) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
        
        const msg = await channel.messages.fetch(args[1]);
        if (!msg) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });

        const newContent = message.content.slice(command.length - 2 + args[0].length + 1 + args[0].length + 2);
        if (!newContent) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });

        let newEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setDescription(newContent);
        
        msg.edit(newEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'edit',
    aliases: []
};
