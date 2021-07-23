exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!send (embed | normal) (texto)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`-send (embed | normal) (texto)\`.`);

        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
        
        let type = args[0];
        let body = args.slice(1).join(' ');

        if (type !== 'embed' && type !== 'normal') return message.channel.send(noCorrectSyntaxEmbed);

        if (type === 'embed') {
            let resultEmbed = new discord.MessageEmbed()
                .setColor(client.colors.primary)
                .setDescription(body);
            message.channel.send(resultEmbed);
        } else if (type === 'normal') {
            message.channel.send(body);
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'send',
    aliases: []
};
