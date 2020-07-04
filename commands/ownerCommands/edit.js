exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //$edit <ID del canal> <ID del mensaje> <nuevo contenido>
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.ownerPrefix}edit <ID del canal> <ID del mensaje> <nuevo contenido>\``);
        
        if (!args[0] || !args[1] || !args[2]) return message.channel.send(noCorrectSyntaxEmbed);
            
        let channel = message.guild.channels.find( c => c.id === args[0]);
        
        if (!channel) return message.channel.send(noCorrectSyntaxEmbed);
        
        let msg = await channel.fetchMessage(args[1]);
        const newContent = message.content.slice(command.length - 2 + args[0].length + 1 + args[0].length + 2);
        
        if (!msg || !newContent) return message.channel.send(noCorrectSyntaxEmbed);
        
        message.delete();

        /*let newEmbed = new discord.MessageEmbed ()
            .setColor(resources.gold)
            .setDescription(newContent);*/

        let newEmbed = newContent;
        
        msg.edit(newEmbed);
    } catch (e) {
        require('../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
