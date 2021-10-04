exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!send (embed | normal) (texto)
    
    try {
        let incorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`-send (embed | normal) (texto)\`.`);

        if (!args[0] || !args[1]) return message.channel.send({ embeds: [incorrectSyntaxEmbed] });
        
        let type = args[0];
        let body = args.slice(1).join(' ');

        if (type !== 'embed' && type !== 'normal') return message.channel.send({ embeds: [incorrectSyntaxEmbed] });

        if (type === 'embed') {
            let resultEmbed = new discord.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setDescription(body);
            message.channel.send({ embeds: [resultEmbed] });
        } else if (type === 'normal') {
            message.channel.send({ embeds: [body] });
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'send',
    aliases: []
};
