exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!commands
    
    try {
        let commandsEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.information)
            .setTitle(`${client.customEmojis.grayTick} En desarrollo ...`)
            .setDescription(`La lista de comandos de **${client.user.username}** se encuentra actualmente en desarrollo.`);
        message.channel.send(commandsEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'commands',
    aliases: ['cmds']
};
