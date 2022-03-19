exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        let incorrectSyntaxEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es:\n\`${client.config.main.prefix}${command}${commandConfig.export.parameters.length > 0 ? ' ' + commandConfig.export.parameters : ''}\`.`);
        
        if (!args[0] || !args[1] || !args[2]) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
            
        const channel = message.guild.channels.cache.find(c => c.id === args[0]);
        if (!channel) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
        
        const msg = await channel.messages.fetch(args[1]);
        if (!msg) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });

        const newContent = message.content.slice(command.length - 2 + args[0].length + 1 + args[0].length + 2);
        if (!newContent) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });

        let newEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setDescription(newContent);
        
        msg.edit({ embeds: [newEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'edit',
    description: 'Edita un mensaje enviado previamente por el bot.',
    aliases: [],
    parameters: '<ID del canal> <ID del mensaje> <nuevo contenido>'
};
