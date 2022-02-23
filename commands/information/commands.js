exports.run = async (client, message, args, command, commandConfig) => {

    //!commands
    
    try {
        message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.information)
            .setTitle(`${client.customEmojis.grayTick} En desarrollo ...`)
            .setDescription(`La lista de comandos de **${client.user.username}** se encuentra actualmente en desarrollo.`)
        ]});
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'commands',
    aliases: ['cmds']
};
