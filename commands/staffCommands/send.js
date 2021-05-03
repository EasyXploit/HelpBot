exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-send (embed | normal) (texto)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`-send (embed | normal) (texto)\`.`);

        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
        
        let type = args[0];
        let body = args.slice(1).join(' ');

        if (type !== 'embed' && type !== 'normal') return message.channel.send(noCorrectSyntaxEmbed);
            
        message.delete();

        if (type === 'embed') {
            let resultEmbed = new discord.MessageEmbed()
                .setColor(resources.gold)
                .setDescription(body);
            message.channel.send(resultEmbed);
        } else if (type === 'normal') {
            message.channel.send(body);
        };
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
